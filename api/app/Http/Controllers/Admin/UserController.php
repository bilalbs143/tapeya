<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\RoleGuardEnum;
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
        return User::query()->user()->with(['creator:id,name,nickname', 'roles']);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $roleIds = $data['role_ids'] ?? null;
        $adminRoleIds = $data['admin_role_ids'] ?? null;
        unset($data['role_ids'], $data['admin_role_ids']);

        if (! isset($data['status'])) {
            $data['status'] = ($data['type'] ?? null) === UserTypeEnum::USER->value
                ? UserStatusEnum::VERIFICATION_PENDING->value
                : UserStatusEnum::ACTIVE->value;
        }

        $data['created_by'] = $request->user()?->id;

        $record = $this->model->create($data);
        if (is_array($roleIds) && count($roleIds) > 0) {
            $appIds = Role::query()
                ->whereIn('id', $roleIds)
                ->where('guard', RoleGuardEnum::APP->value)
                ->pluck('id')
                ->toArray();
            $adminIds = is_array($adminRoleIds)
                ? Role::query()
                    ->whereIn('id', $adminRoleIds)
                    ->where('guard', RoleGuardEnum::ADMIN->value)
                    ->pluck('id')
                    ->toArray()
                : [];
            $record->roles()->sync(array_values(array_unique(array_merge($appIds, $adminIds))));
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
        $validated = $request->validated();
        $roleIds = $validated['role_ids'] ?? null;
        $adminRoleIds = $validated['admin_role_ids'] ?? null;

        return $this->_patch($request, $user, null, function ($record) use ($roleIds, $adminRoleIds): void {
            if (! is_array($roleIds) && ! is_array($adminRoleIds)) {
                return;
            }
            $appIds = is_array($roleIds)
                ? Role::query()
                    ->whereIn('id', $roleIds)
                    ->where('guard', RoleGuardEnum::APP->value)
                    ->pluck('id')
                    ->toArray()
                : $record->roles()
                    ->where('roles.guard', RoleGuardEnum::APP->value)
                    ->pluck('roles.id')
                    ->toArray();
            $adminIds = is_array($adminRoleIds)
                ? Role::query()
                    ->whereIn('id', $adminRoleIds)
                    ->where('guard', RoleGuardEnum::ADMIN->value)
                    ->pluck('id')
                    ->toArray()
                : $record->roles()
                    ->where('roles.guard', RoleGuardEnum::ADMIN->value)
                    ->pluck('roles.id')
                    ->toArray();
            $record->roles()->sync(array_values(array_unique(array_merge($appIds, $adminIds))));
        }, function (array &$data): void {
            if (isset($data['password']) && $data['password'] === '') {
                unset($data['password']);
            }
            unset($data['role_ids'], $data['admin_role_ids']);
        });
    }

    public function destroy(User $user): JsonResponse
    {
        return $this->_destroy($user, null);
    }
}
