<?php

namespace App\Services\Broadcast;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Innings;
use App\Models\MatchGraphicSession;
use App\Models\MatchSetting;
use App\Models\TournamentMatch;
use App\Services\InningsStatsService;
use App\Support\Media\MediaDisk;
use App\Support\Scoring\MatchPendingState;
use Illuminate\Support\Facades\Log;

/**
 * Composes the full graphic `context` JSON from match + innings data.
 *
 * Persistence and Reverb broadcasts are handled by {@see GraphicContextOrchestrator}.
 */
final class GraphicContextBuilder
{
    public function __construct(
        private readonly GraphicLiveStatsBuilder $liveStats,
        private readonly GraphicLeaderboardBuilder $leaderboards,
        private readonly GraphicStandingsBuilder $standings,
        private readonly TournamentGraphicAggregatesService $tournamentAggregates,
        private readonly GraphicSquadBuilder $squadBuilder,
        private readonly NextMatchFixtureBuilder $nextMatchFixture,
    ) {}

    /**
     * Build the full context array without persisting it.
     */
    public function build(TournamentMatch $match, array $pending = []): array
    {
        $match->loadMissing(['homeTeam', 'awayTeam', 'tournament']);

        // Load innings with pre-sorted balls (no per-ball relationships — we
        // collect all player IDs and do one bulk User lookup below).
        $innings = $match->innings()
            ->with([
                'battingTeam',
                'bowlingTeam',
                'balls' => fn ($q) => $q->orderBy('over')->orderBy('ball_in_over')->orderBy('id'),
            ])
            ->orderBy('innings_number')
            ->get();
        $base = $this->buildBase($match);

        $context = $base;

        if ($innings->isNotEmpty()) {
            /** Active innings: same selection as {@see MatchStateService::build()}. */
            $active = $innings->firstWhere('status', 'in_progress')
                ?? $innings->first(fn (Innings $i) => $i->status !== 'completed')
                ?? $innings->last();
            $first = $innings->firstWhere('innings_number', 1);

            // Bulk-load all player names (including pending players so new
            // batsmen/bowlers show their real name before their first ball).
            $pendingIds = array_values(array_filter([
                isset($pending['next_batter_id']) ? (int) $pending['next_batter_id'] : null,
                isset($pending['next_non_striker_id']) ? (int) $pending['next_non_striker_id'] : null,
                isset($pending['next_bowler_id']) ? (int) $pending['next_bowler_id'] : null,
            ]));
            $players = InningsStatsService::playersFromDatabase($active->balls, $pendingIds);
            $playerNames = array_map(fn (array $p) => $p['name'], $players);
            $playerPhotos = array_map(fn (array $p) => $p['avatar_url'], $players);

            $context = array_merge(
                $context,
                $this->liveStats->buildLive($match, $active, $first, $playerNames, $pending, $playerPhotos),
                [
                    'innings_chart' => $this->liveStats->buildInningsChart($match, $innings),
                    'innings_summaries' => $this->liveStats->buildCompletedInningsSummaries($match, $innings),
                ],
            );
        }

        return array_merge(
            $context,
            $this->leaderboards->leaderboardFragment($match),
            $this->standings->standingsFragment($match),
            $this->squadBuilder->buildForMatch($match),
        );
    }

    private function buildBase(TournamentMatch $match): array
    {
        $logoUrl = static fn (?string $path): ?string => MediaDisk::url($path);

        $home = $match->homeTeam;
        $away = $match->awayTeam;
        $tournament = $match->tournament;

        $matchContext = self::graphicSessionMatchSlice($match);

        if (config('app.debug')) {
            Log::debug('graphic_context.match_base', [
                'match_id' => $match->id,
                'match_status' => $matchContext['status'],
                'winning_team_id' => $match->winning_team_id,
                'is_no_result' => (bool) $match->is_no_result,
                'result_summary' => $matchContext['result_summary'],
                'winning_team_side' => $matchContext['winning_team'],
            ]);
        }

        $tournamentId = (int) ($match->tournament_id ?? 0);

        return [
            'match' => $matchContext,
            'tournament' => [
                'name' => $tournament?->tournament_name ?? '',
                'short' => $tournament?->short_name ?? '',
                'logo_url' => $tournament ? $logoUrl($tournament->display_image) : null,
            ],
            'tournament_aggregates' => $this->tournamentAggregates->buildForTournament($tournamentId),
            'next_match_fixture' => $this->nextMatchFixture->buildForMatch($match),
            'home_team' => [
                'id' => $match->home_team_id !== null ? (int) $match->home_team_id : null,
                'name' => $home?->name ?? '',
                'short_code' => $home?->code ?? '',
                'abbrev_display' => $home?->code ?? '',
                'logo_url' => $logoUrl($home?->logo),
            ],
            'away_team' => [
                'id' => $match->away_team_id !== null ? (int) $match->away_team_id : null,
                'name' => $away?->name ?? '',
                'short_code' => $away?->code ?? '',
                'abbrev_display' => $away?->code ?? '',
                'logo_url' => $logoUrl($away?->logo),
            ],
        ];
    }

    /**
     * `context.match` slice from the live matches row (result, status, winner side).
     * Public static so API resources and broadcast events can merge the same
     * fields without duplicating logic or going through the container.
     *
     * @return array{
     *   number: string,
     *   venue: string,
     *   venue_display_line: string,
     *   status: string,
     *   is_completed: bool,
     *   result_summary: string|null,
     *   winning_team: 'home'|'away'|null,
     *   toss_winner_side: 'home'|'away'|null,
     *   chose_to_bat_or_bowl: string|null,
     *   home_team_name: string,
     *   away_team_name: string,
     *   home_team_id: int,
     *   away_team_id: int,
     *   home_team_short_code: string,
     *   away_team_short_code: string,
     *   home_team_logo_url: string|null,
     *   away_team_logo_url: string|null,
     *   wagon_wheel_enabled: bool,
     *   officials: array{
     *     umpires: array{text: string, lines: list<string>},
     *     scorers: array{text: string, lines: list<string>},
     *     commentators: array{text: string, lines: list<string>}
     *   }
     * }
     */
    public static function graphicSessionMatchSlice(TournamentMatch $match): array
    {
        $match->loadMissing(['homeTeam', 'awayTeam', 'playerOfMatch']);

        $settings = MatchSetting::resolveFor($match);

        $logoUrl = static fn (?string $path): ?string => MediaDisk::url($path);

        $home = $match->homeTeam;
        $away = $match->awayTeam;

        $winningTeam = null;
        if ($match->winning_team_id !== null) {
            if ((int) $match->winning_team_id === (int) $match->home_team_id) {
                $winningTeam = 'home';
            } elseif ((int) $match->winning_team_id === (int) $match->away_team_id) {
                $winningTeam = 'away';
            }
        }

        $tossWinnerSide = null;
        if ($match->toss_winner_team_id !== null) {
            if ((int) $match->toss_winner_team_id === (int) $match->home_team_id) {
                $tossWinnerSide = 'home';
            } elseif ((int) $match->toss_winner_team_id === (int) $match->away_team_id) {
                $tossWinnerSide = 'away';
            }
        }

        $chose = $match->chose_to_bat_or_bowl;
        $choseStr = is_string($chose) && $chose !== '' ? $chose : null;

        $venue = trim((string) ($match->venue_name ?? $match->tournament?->venue_name ?? ''));
        $venueDisplayLine = $venue !== '' ? 'LIVE FROM '.$venue : '';

        return [
            'number' => (string) ($match->group_index ?? $match->id),
            'venue' => $venue,
            'venue_display_line' => $venueDisplayLine,
            'status' => $match->status?->value ?? 'scheduled',
            'is_completed' => $match->status === MatchStatusEnum::COMPLETED,
            'result_summary' => $match->resultSummary(),
            'winning_team' => $winningTeam,
            'toss_winner_side' => $tossWinnerSide,
            'chose_to_bat_or_bowl' => $choseStr,
            'home_team_id' => (int) $match->home_team_id,
            'away_team_id' => (int) $match->away_team_id,
            'home_team_name' => $home?->name ?? '',
            'away_team_name' => $away?->name ?? '',
            'home_team_short_code' => $home?->code ?? '',
            'away_team_short_code' => $away?->code ?? '',
            'home_team_logo_url' => $logoUrl($home?->logo),
            'away_team_logo_url' => $logoUrl($away?->logo),
            'wagon_wheel_enabled' => (bool) ($match->wagon_wheel_enabled ?? false),
            'player_of_match_user_id' => $match->player_of_match_user_id !== null
                ? (int) $match->player_of_match_user_id
                : null,
            'player_of_match_name' => $match->playerOfMatch?->name
                ?? $match->playerOfMatch?->nickname
                ?? null,
            'max_overs_per_innings' => (int) ($match->overs ?? 0),
            'players_per_side' => (int) ($match->players_per_side ?? 11),
            'officials' => $settings->toContextOfficialsFragment(),
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public static function mergeGraphicSessionMatchIntoContext(array $context, TournamentMatch $match): array
    {
        $context['match'] = array_merge($context['match'] ?? [], self::graphicSessionMatchSlice($match));

        return $context;
    }

    /**
     * Merge persisted session JSON with a fresh {@see build()} for API responses and broadcasts.
     *
     * @return array<string, mixed>
     */
    public function mergeSessionContext(MatchGraphicSession $session, TournamentMatch $match): array
    {
        $persisted = is_array($session->context) ? $session->context : [];

        return array_merge($persisted, $this->build($match, MatchPendingState::resolve($match)));
    }
}
