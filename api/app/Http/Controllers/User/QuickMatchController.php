<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreQuickMatchPlayerRequest;
use App\Http\Requests\User\StoreQuickMatchRequest;
use App\Http\Requests\User\UpdateQuickMatchRequest;
use App\Http\Resources\User\QuickMatchResource;
use App\Models\CricketMatch;
use App\Models\Team;
use App\Models\User;
use App\Services\MatchStateService;
use App\Services\QuickMatch\QuickMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class QuickMatchController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly QuickMatchService $quickMatches,
        private readonly MatchStateService $matchState,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = CricketMatch::query()
            ->where('kind', MatchKindEnum::QUICK)
            ->where('created_by', $user->id)
            ->with(['homeTeam', 'awayTeam', 'createdBy', 'tossWinnerTeam', 'tournament'])
            ->orderByDesc('match_date')
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $page = $this->paginateOrAll($query);
        if (method_exists($page, 'getCollection')) {
            $this->quickMatches->hydrateSquadPlayersForMatches($page->getCollection());
        } else {
            $this->quickMatches->hydrateSquadPlayersForMatches(collect($page));
        }

        return $this->success(QuickMatchResource::collection($page));
    }

    public function store(StoreQuickMatchRequest $request): JsonResponse
    {
        $match = $this->quickMatches->create($request->user(), $request->validated());

        $payload = (new QuickMatchResource($match))->toArray($request);
        if ($match->status === MatchStatusEnum::TOSS_DONE) {
            $payload['match_state'] = $this->matchState->build($match);
        }

        return $this->success($payload, 'Quick match created.', 'CREATED');
    }

    public function show(Request $request, CricketMatch $quickMatch): JsonResponse
    {
        return $this->success(new QuickMatchResource($this->quickMatches->loadForResource($quickMatch)));
    }

    public function update(UpdateQuickMatchRequest $request, CricketMatch $quickMatch): JsonResponse
    {
        if ($quickMatch->status !== MatchStatusEnum::SCHEDULED) {
            return $this->conflict('Match settings can only be changed before toss.');
        }

        $match = $this->quickMatches->updateScheduled($quickMatch, $request->user(), $request->validated());

        return $this->success(new QuickMatchResource($match), 'Quick match updated.');
    }

    public function addPlayer(
        StoreQuickMatchPlayerRequest $request,
        CricketMatch $quickMatch,
        Team $team,
    ): JsonResponse {
        if (! in_array((int) $team->id, [(int) $quickMatch->home_team_id, (int) $quickMatch->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        try {
            $player = $this->quickMatches->addPlayer($request->user(), $quickMatch, $team, $request->validated());
        } catch (ValidationException $e) {
            $messages = $e->errors();
            $first = collect($messages)->flatten()->first();
            if (is_string($first) && str_contains(strtolower($first), 'completed')) {
                return $this->conflict($first);
            }
            throw $e;
        }
        $match = $this->quickMatches->loadForResource($quickMatch->fresh());

        return $this->success(
            [
                'player' => [
                    'id' => (int) $player->id,
                    'name' => $player->name,
                    'nickname' => $player->nickname,
                    'added_via_quick_match' => (bool) $player->added_via_quick_match,
                ],
                'match' => new QuickMatchResource($match),
            ],
            'Player added.',
            'CREATED',
        );
    }

    public function removePlayer(
        Request $request,
        CricketMatch $quickMatch,
        Team $team,
        User $user,
    ): JsonResponse {
        $actor = $request->user();
        if ($actor === null || ! $actor->canOperateQuickMatch($quickMatch)) {
            return $this->forbidden('You cannot manage players for this match.');
        }

        if (! in_array((int) $team->id, [(int) $quickMatch->home_team_id, (int) $quickMatch->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        try {
            $this->quickMatches->removePlayer($quickMatch, $team, $user);
        } catch (ValidationException $e) {
            $first = collect($e->errors())->flatten()->first();
            if (is_string($first) && (
                str_contains(strtolower($first), 'completed')
                || str_contains(strtolower($first), 'cancelled')
                || str_contains(strtolower($first), 'once the match has started')
            )) {
                return $this->conflict($first);
            }
            throw $e;
        }
        $match = $this->quickMatches->loadForResource($quickMatch->fresh());

        return $this->success(
            [
                'removed_user_id' => (int) $user->id,
                'match' => new QuickMatchResource($match),
            ],
            'Player removed.',
        );
    }
}
