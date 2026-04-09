<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Http\Resources\Admin\User\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(User::class, UserResource::class, 'user');
    }

    protected function baseQuery()
    {
        return User::query()->user();
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $roleIds = $data['role_ids'] ?? null;
        unset($data['role_ids']);

        if (! isset($data['status'])) {
            $data['status'] = ($data['type'] ?? null) === UserTypeEnum::USER->value
                ? UserStatusEnum::VERIFICATION_PENDING->value
                : UserStatusEnum::ACTIVE->value;
        }

        $record = $this->model->create($data);
        if (is_array($roleIds) && count($roleIds) > 0) {
            $record->roles()->sync(
                Role::whereIn('id', $roleIds)->where('guard', 'app')->pluck('id')->toArray()
            );
        }
        $record = $this->refresh($record);

        return $this->success(new UserResource($record), null, 'CREATED');
    }

    public function show(User $user): JsonResponse
    {
        return $this->_show($user);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $roleIds = $request->validated()['role_ids'] ?? null;

        return $this->_patch($request, $user, null, function ($record) use ($roleIds): void {
            if (is_array($roleIds)) {
                $record->roles()->sync(
                    Role::whereIn('id', $roleIds)->where('guard', 'app')->pluck('id')->toArray()
                );
            }
        }, function (array &$data): void {
            if (isset($data['password']) && $data['password'] === '') {
                unset($data['password']);
            }
            unset($data['role_ids']);
        });
    }

    public function destroy(User $user): JsonResponse
    {
        return $this->_destroy($user, null);
    }
}
