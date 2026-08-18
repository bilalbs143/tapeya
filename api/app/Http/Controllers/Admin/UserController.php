<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Http\Resources\Admin\User\UserResource;
use App\Models\LiveStream;
use App\Models\Role;
use App\Models\User;
use App\Streaming\LiveStreamService;
use Illuminate\Http\JsonResponse;

class UserController extends BaseAdminController
{
    public function __construct(private LiveStreamService $liveStreamService)
    {
        parent::__construct(User::class, UserResource::class, 'user');
    }

    protected function baseQuery()
    {
        return User::query()->user()->with(['creator:id,name,nickname', 'referrer:id,nickname', 'roles']);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $adminRoleIds = $data['admin_role_ids'] ?? null;
        unset($data['admin_role_ids']);

        if (! isset($data['status'])) {
            $data['status'] = ($data['type'] ?? null) === UserTypeEnum::USER->value
                ? UserStatusEnum::VERIFICATION_PENDING->value
                : UserStatusEnum::ACTIVE->value;
        }

        $data['created_by'] = $request->user()?->id;

        $record = $this->model->create($data);
        if (is_array($adminRoleIds)) {
            $adminIds = Role::query()
                ->whereIn('id', $adminRoleIds)
                ->where('guard', RoleGuardEnum::ADMIN->value)
                ->pluck('id')
                ->toArray();
            $record->roles()->sync($adminIds);
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
        $adminRoleIds = $validated['admin_role_ids'] ?? null;
        $wasAllowedToBroadcast = (bool) $user->can_broadcast;
        $revokingBroadcast = array_key_exists('can_broadcast', $validated)
            && ! (bool) $validated['can_broadcast']
            && $wasAllowedToBroadcast;

        $response = $this->_patch($request, $user, null, function ($record) use ($adminRoleIds): void {
            if (! is_array($adminRoleIds)) {
                return;
            }
            $adminIds = Role::query()
                ->whereIn('id', $adminRoleIds)
                ->where('guard', RoleGuardEnum::ADMIN->value)
                ->pluck('id')
                ->toArray();
            $record->roles()->sync($adminIds);
        }, function (array &$data): void {
            if (isset($data['password']) && $data['password'] === '') {
                unset($data['password']);
            }
            unset($data['admin_role_ids']);
        });

        // Clearing "Allow broadcast" without Ban must still cut off reconnect — same stream
        // cleanup as broadcastBan(), otherwise an in-progress owner can keep refetching ingest.
        if ($revokingBroadcast) {
            $this->revokeActiveSelfServeBroadcasts($user->fresh());
        }

        return $response;
    }

    public function destroy(User $user): JsonResponse
    {
        return $this->_destroy($user, null);
    }

    /**
     * Revoke self-serve broadcasting access: sets can_broadcast = false, ends every currently
     * active self-serve stream for this user (v1 only ever allows one at a time per
     * assertNoActiveSelfServeStream(), but this action does not assume that invariant holds).
     * Idle streams (never went live) are deleted outright, not ended — mirrors
     * EndExpiredBroadcasts' case 2 reasoning. Streams that did go live are ended and their
     * YouTube recording is kept — deletion is manual from backoffice only when needed.
     */
    public function broadcastBan(User $user): JsonResponse
    {
        $user->update(['can_broadcast' => false]);

        $endedStreams = $this->revokeActiveSelfServeBroadcasts($user);

        return $this->success([
            'can_broadcast' => false,
            'ended_streams' => $endedStreams,
        ], 'Broadcast access revoked.');
    }

    /**
     * End/delete every currently-active self-serve stream owned by this user.
     * Idle (never went live) is deleted via LiveStreamService::delete() — end()'s
     * transition('complete', ...) can fail on a broadcast that never went live and
     * would leave an orphaned draft (same as EndExpiredBroadcasts case 2). Streams
     * that went live are only ended; recordings are not auto-deleted.
     */
    private function revokeActiveSelfServeBroadcasts(User $user): int
    {
        $activeStreams = LiveStream::query()
            ->where('owner_user_id', $user->id)
            ->whereIn('status', ['idle', 'starting', 'live'])
            ->get();

        if ($activeStreams->isEmpty()) {
            return 0;
        }

        foreach ($activeStreams as $stream) {
            if ($stream->status === 'idle') {
                $this->liveStreamService->delete($stream);

                continue;
            }

            $this->liveStreamService->end($stream);
        }

        return $activeStreams->count();
    }
}
