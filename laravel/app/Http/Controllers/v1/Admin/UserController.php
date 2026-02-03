<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\User\UserTypeEnum;
use App\Http\Requests\v1\Admin\User\PatchUserRequest;
use App\Http\Requests\v1\Admin\User\SyncUserPermissionsRequest;
use App\Http\Resources\v1\User\MemberResource;
use App\Models\User;

class UserController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(User::class, MemberResource::class, 'user');
    }

    protected function baseQuery()
    {
        return $this->model->whereIn('type', [
            // UserTypeEnum::ADMINISTRATOR,
            UserTypeEnum::AGENT,
            UserTypeEnum::USER,
        ])->filterUsersByAgentRole();
    }

    public function show(User $user)
    {
        $user = $this->refresh($user);

        return response()->success($user->getResource());
    }

    public function patch(PatchUserRequest $request, User $user)
    {
        return $this->_patch($request, $user, dataMapper: function (&$data) use ($request) {
            if (! ($request->has('change_password') && $request->change_password)) {
                if (isset($data['password'])) {
                    unset($data['password']);
                }
            }
        });
    }

    public function syncPermissions(SyncUserPermissionsRequest $request, USer $user)
    {
        // for now it's only allowed for agents
        if (! $user->isAgent()) {
            return $this->forbidden('forbidden');
        }

        $user->syncPermissions($request->permissions);

        // after permissions updated, log user out of his session so that he can login again with new permissions
        $user->revokeAllTokens();

        return $this->success($user->getResource(), 'permissions_synced_successfully');

    }
}
