<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Player\StoreBroadcasterPlayerRequest;
use App\Http\Requests\Admin\Player\StorePlayerCsvImportRequest;
use App\Http\Requests\Admin\Player\UpdateBroadcasterPlayerRequest;
use App\Http\Resources\Admin\User\UserResource;
use App\Models\LiveStream;
use App\Models\User;
use App\Services\User\PlayerCsvImportService;
use App\Streaming\LiveStreamService;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Player registry: {@see UserTypeEnum::USER} accounts without admin-guard roles.
 */
class PlayerController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private LiveStreamService $liveStreamService) {}

    /**
     * CSV bulk import. Each row creates one app user.
     * Authorization: same as other admin routes (`auth:api`, `admin.only`).
     */
    public function importCsv(StorePlayerCsvImportRequest $request, PlayerCsvImportService $importService): JsonResponse
    {
        $result = $importService->import(
            $request->file('file'),
            $request->boolean('dry_run'),
            $request->user()
        );

        return $this->success($result, ($result['dry_run'] ?? false) ? 'Dry run finished.' : 'Import finished.');
    }

    public function index()
    {
        $query = QueryBuilder::for($this->playerBaseQuery())
            ->allowedFilters(User::getFilters())
            ->defaultSort('-id')
            ->allowedSorts(User::getSorts());

        return UserResource::collection($this->paginateOrAll($query));
    }

    public function store(StoreBroadcasterPlayerRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'nickname' => $data['nickname'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'playing_role' => $data['playing_role'] ?? null,
            'bowling_style' => $data['bowling_style'] ?? null,
            'batting_style' => $data['batting_style'] ?? null,
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'can_broadcast' => (bool) ($data['can_broadcast'] ?? false),
            'is_official' => (bool) ($data['is_official'] ?? false),
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'created_by' => $request->user()?->id,
        ]);

        return $this->success(new UserResource($this->resolvePlayer($user->id)), 'Player created.', 'CREATED');
    }

    public function show(User $player): JsonResponse
    {
        return $this->success(new UserResource($this->resolvePlayer($player->id)));
    }

    public function update(UpdateBroadcasterPlayerRequest $request, User $player): JsonResponse
    {
        $player = $this->resolvePlayer($player->id);
        $data = $request->validated();
        if ($data === []) {
            return $this->success(new UserResource($player));
        }

        $wasAllowedToBroadcast = (bool) $player->can_broadcast;
        $revokingBroadcast = array_key_exists('can_broadcast', $data)
            && ! (bool) $data['can_broadcast']
            && $wasAllowedToBroadcast;

        $player->update($data);

        if ($revokingBroadcast) {
            $this->revokeActiveSelfServeBroadcasts($player->fresh());
        }

        return $this->success(new UserResource($this->resolvePlayer($player->id)), 'Player updated.');
    }

    /**
     * Revoke self-serve broadcasting access for a player account.
     */
    public function broadcastBan(User $player): JsonResponse
    {
        $player = $this->resolvePlayer($player->id);
        $player->update(['can_broadcast' => false]);

        $endedStreams = $this->revokeActiveSelfServeBroadcasts($player);

        return $this->success([
            'can_broadcast' => false,
            'ended_streams' => $endedStreams,
        ], 'Broadcast access revoked.');
    }

    private function playerBaseQuery()
    {
        return User::query()->player()->with(['creator:id,name,nickname']);
    }

    private function resolvePlayer(int $id): User
    {
        return $this->playerBaseQuery()->findOrFail($id);
    }

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
