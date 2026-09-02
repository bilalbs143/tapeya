<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserTournamentRequest;
use App\Http\Resources\User\TournamentResource;
use App\Models\Tournament;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentUserReaction;
use App\Services\Tournament\TournamentCreationService;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;

class TournamentController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly TournamentCreationService $tournamentCreation,
    ) {}

    /**
     * List tournaments (for app: e.g. to pick tournament when creating teams or viewing schedule).
     * Query organizer_tournaments=1 scopes the list to tournaments organized by the authenticated user.
     * Public lists default to open tournaments only (private tournaments are organizer-only).
     */
    public function index(): JsonResponse
    {
        $query = QueryBuilder::for(Tournament::class)
            ->allowedFilters(Tournament::getFilters())
            ->defaultSort('-start_date')
            ->allowedSorts(Tournament::getSorts())
            ->withCount(['teams', 'matches']);

        $isOrganizerScope = request()->boolean('organizer_tournaments');

        if ($isOrganizerScope) {
            $uid = request()->user()->id;
            $query->where(function ($q) use ($uid) {
                $q->where('organizer_id', $uid)
                    ->orWhere('created_by', $uid)
                    ->orWhereHas('broadcasters', fn ($b) => $b->whereKey($uid));
            });
        } else {
            $query->where('tournament_type', TournamentTypeEnum::OPEN_TOURNAMENT);
        }

        // Scorecard hub: with_matches loads fixtures. Public lists stay open-only;
        // organizer scope may include private tournaments (e.g. unified my-matches).
        if (request()->boolean('with_matches')) {
            if (! $isOrganizerScope) {
                $query->where('tournament_type', TournamentTypeEnum::OPEN_TOURNAMENT);
            }
            $query->with([
                'matches.homeTeam',
                'matches.awayTeam',
                'matches.winningTeam',
                'matches.stream',
            ]);
        }

        $user = request()->user();
        if ($user?->isUser()) {
            request()->attributes->set(
                'manageable_tournament_ids',
                Tournament::query()
                    ->where(function ($q) use ($user) {
                        $uid = $user->id;
                        $q->where('organizer_id', $uid)
                            ->orWhere('created_by', $uid)
                            ->orWhereHas('broadcasters', fn ($b) => $b->whereKey($uid));
                    })
                    ->pluck('id')
                    ->flip()
            );
        }

        return $this->success(TournamentResource::collection($this->paginateOrAll($query)));
    }

    /**
     * Create a tournament instantly (no admin approval). Submitter becomes organizer.
     */
    public function store(StoreUserTournamentRequest $request): JsonResponse
    {
        $tournament = $this->tournamentCreation->createForUser(
            $request->user(),
            $request->validated(),
        );
        $tournament->loadCount(['teams', 'matches']);

        return $this->success(new TournamentResource($tournament), 'Tournament created.', 'CREATED');
    }

    /**
     * Show one tournament (with optional matches loaded).
     * Use GET /tournaments/{id}/teams for the list of teams.
     */
    public function show(Tournament $tournament): JsonResponse
    {
        $with = [];
        if (request()->boolean('with_matches')) {
            $with[] = 'matches.homeTeam';
            $with[] = 'matches.awayTeam';
            $with[] = 'matches.winningTeam';
            $with[] = 'matches.stream';
        }
        if ($with !== []) {
            $tournament->load($with);
        }

        $tournament->loadCount('matches');

        if (request()->user()) {
            $myReaction = TournamentUserReaction::query()
                ->where('tournament_id', $tournament->id)
                ->where('user_id', request()->user()->id)
                ->value('reaction');
            $tournament->setAttribute('my_reaction', $myReaction);
        }

        $campaignSlug = TournamentInterestCampaign::query()
            ->where('tournament_id', $tournament->id)
            ->where('status', TournamentInterestCampaignStatusEnum::OPEN->value)
            ->orderByDesc('id')
            ->value('slug');
        $tournament->setAttribute('interest_campaign_slug', $campaignSlug);

        return $this->success(new TournamentResource($tournament));
    }
}
