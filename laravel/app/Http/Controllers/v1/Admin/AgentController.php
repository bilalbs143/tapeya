<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\User\UserTypeEnum;
use App\Events\Admin\Agent\AgentCreated;
use App\Events\Admin\Agent\AgentDeleted;
use App\Events\Admin\Agent\AgentPasswordUpdated;
use App\Events\Admin\Agent\AgentUpdated;
use App\Http\Requests\v1\Admin\Agent\CreateAgentRequest;
use App\Http\Requests\v1\Admin\Agent\PatchAgentRequest;
use App\Http\Requests\v1\Admin\Agent\UpdateAgentRequest;
use App\Http\Resources\v1\User\AgentHeirachyResource;
use App\Http\Resources\v1\User\AgentResource;
use App\Models\User;
use App\Utils\Services\Utils;

class AgentController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(User::class, AgentResource::class, 'agent');
    }

    protected function baseQuery()
    {
        return $this->model->agent()->with([
            'bank_account',
            'domains',
            'wallet',
            'grand_children',
            'members',
        ])->filterAgentsByAgentRole();
    }

    public function hierarchy()
    {
        $records = User::root()->when(Utils::isAgent(), function ($q) {
            $q->where('id', auth()->id());
        })->with('grand_children')->orderBy('created_at', 'asc')->get();

        return $this->success(AgentHeirachyResource::collection($records));
    }

    public function store(CreateAgentRequest $request)
    {
        $data = $request->validated();
        if (Utils::isAgent()) {
            $data['parent_id'] = auth()->id();
        }
        $data['type'] = UserTypeEnum::AGENT;

        if (isset($data['parent_id'])) {
            // Validate losing ratio to be lesser than parent
            $parent = User::findOrFail($data['parent_id']);
            if ($data['losing_point_ratio'] >= $parent->losing_point_ratio) {
                return $this->failure('AGENT_LOSING_RATIO_CANNOT_BE_GREATER_THAN_PARENT', 422);
            }
        }

        $user = User::create($data);
        $user->createBank($data);

        AgentCreated::dispatch($user);

        $user = User::with(['bank_account', 'domains', 'wallet'])->findOrFail($user->id);

        return $this->success(new AgentResource($user), 'agent_created', 201);
    }

    public function show(User $user)
    {
        return $this->_show($user);
    }

    private function updateAgent(User $user, array $data)
    {
        $user->update($data);
        $user->updateBank($data);
        if ($user->bank_account && $user->bank_account?->isChanged()) {
            $user->touch();
        }

        AgentPasswordUpdated::dispatchIf($user->wasChanged('password'), $user);

        $changes = [...$user->getChanges()];
        unset($changes['updated_by'], $changes['updated_at']);
        if (count($changes) === 1 && $user->wasChanged('password') && (! $user->bank_account || ! $user->bank_account?->isChanged())) {
            return $user;
        }

        AgentUpdated::dispatchIf($user->isChanged() || $user->bank_account?->isChanged(), $user);

        return $user;
    }

    public function update(UpdateAgentRequest $request, User $user)
    {
        $data = $request->validated();
        $user = $this->updateAgent($user, $data);

        return $this->success(new AgentResource($user), 'agent_updated');
    }

    public function patch(PatchAgentRequest $request, User $user)
    {
        $data = $request->validated();

        if (isset($data['parent_id'])) {
            // Validate losing ratio to be lesser than parent
            $parent = User::findOrFail($data['parent_id']);
            if ($data['losing_point_ratio'] >= $parent->losing_point_ratio) {
                return $this->failure('AGENT_LOSING_RATIO_CANNOT_BE_GREATER_THAN_PARENT', 422);
            }
        }

        if (! ($request->has('change_password') && $request->change_password)) {
            if (isset($data['password'])) {
                unset($data['password']);
            }
        }
        $user = $this->updateAgent($user, $data);
        $user->createDomains($data);

        return $this->success(new AgentResource($user), 'agent_updated');
    }

    public function destroy(User $user)
    {
        return $this->_destroy($user, callback: fn ($user) => AgentDeleted::dispatch($user));
    }
}
