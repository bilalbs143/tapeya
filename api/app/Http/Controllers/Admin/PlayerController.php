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
use App\Models\User;
use App\Services\User\PlayerCsvImportService;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Player registry: all {@see UserTypeEnum::USER} accounts (assignment-based; no app roles).
 */
class PlayerController extends Controller
{
    use BaseControllerTrait;

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
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::VERIFICATION_PENDING,
            'created_by' => $request->user()?->id,
        ]);

        return $this->success(new UserResource($user->fresh(['roles', 'creator:id,name,nickname', 'referrer:id,nickname'])), 'Player created.', 'CREATED');
    }

    public function show(User $player): JsonResponse
    {
        return $this->success(new UserResource($player->fresh(['roles', 'creator:id,name,nickname', 'referrer:id,nickname'])));
    }

    public function update(UpdateBroadcasterPlayerRequest $request, User $player): JsonResponse
    {
        $data = $request->validated();
        if ($data === []) {
            return $this->success(new UserResource($player->fresh(['roles', 'creator:id,name,nickname', 'referrer:id,nickname'])));
        }
        $player->update($data);

        return $this->success(new UserResource($player->fresh(['roles', 'creator:id,name,nickname', 'referrer:id,nickname'])), 'Player updated.');
    }

    private function playerBaseQuery()
    {
        return User::query()->user()->with(['creator:id,name,nickname', 'referrer:id,nickname']);
    }
}
