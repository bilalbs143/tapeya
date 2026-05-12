<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\TournamentResource;
use App\Models\Tournament;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentUserReaction;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;

class TournamentController extends Controller
{
    use BaseControllerTrait;

    /**
     * List tournaments (for app: e.g. to pick tournament when creating teams or viewing schedule).
     * Query organizer_tournaments=1 scopes the list to tournaments organized by the authenticated user.
     */
    public function index(): JsonResponse
    {
        $query = QueryBuilder::for(Tournament::class)
            ->allowedFilters(Tournament::getFilters())
            ->defaultSort('-start_date')
            ->allowedSorts(Tournament::getSorts())
            ->withCount('teams');

        if (request()->boolean('organizer_tournaments')) {
            $uid = request()->user()->id;
            $query->where(function ($q) use ($uid) {
                $q->where('organizer_id', $uid)
                    ->orWhere('created_by', $uid)
                    ->orWhereHas('broadcasters', fn ($b) => $b->whereKey($uid));
            });
        }

        // Optionally eager-load matches for each tournament (for user scorecard views).
        if (request()->boolean('with_matches')) {
            $query->with([
                'matches.homeTeam',
                'matches.awayTeam',
                'matches.winningTeam',
            ]);
        }

        return $this->success(TournamentResource::collection($this->paginateOrAll($query)));
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
        }
        if ($with !== []) {
            $tournament->load($with);
        }

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
