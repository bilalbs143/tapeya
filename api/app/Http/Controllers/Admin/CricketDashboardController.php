<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\ActivePlatformEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Single-endpoint cricket dashboard stats.
 *
 * Aggregates all data for the admin cricket dashboard in one HTTP round-trip.
 * Heavy queries use DB:: directly to avoid Eloquent overhead on large datasets.
 */
class CricketDashboardController extends Controller
{
    use BaseControllerTrait;

    public function __invoke(): JsonResponse
    {
        return $this->success($this->buildDashboardPayload());
    }

    /**
     * @return array<string, mixed>
     */
    private function buildDashboardPayload(): array
    {
        $today = now()->toDateString();
        $now = Carbon::now();
        $thirtyAgo = $now->copy()->subDays(29)->startOfDay();
        $sixMonths = $now->copy()->subMonths(5)->startOfMonth();

        // ── KPI Counts ────────────────────────────────────────────────────────
        $tournamentsTotal = Tournament::query()->count();

        // "Active" = live window (started and not yet ended)
        $tournamentsActive = Tournament::query()
            ->whereNotNull('start_date')
            ->whereDate('start_date', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
            })
            ->count();

        $matchesTotal = TournamentMatch::query()->count();
        $matchesCompleted = TournamentMatch::query()->where('status', 'completed')->count();
        $teamsTotal = Team::query()->count();

        // Players = app users (type = user)
        $playersTotal = User::query()->user()->count();

        // ── Tournament Phase Breakdown ────────────────────────────────────────
        $phaseUpcoming = Tournament::query()
            ->whereNotNull('start_date')
            ->whereDate('start_date', '>', $today)
            ->count();
        $phaseLive = $tournamentsActive;
        $phaseCompleted = Tournament::query()
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->count();

        // ── Match Status Breakdown ────────────────────────────────────────────
        $matchStatusCounts = TournamentMatch::query()
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->all();

        $matchStatus = [
            'scheduled' => (int) ($matchStatusCounts['scheduled'] ?? 0),
            'toss_done' => (int) ($matchStatusCounts['toss_done'] ?? 0),
            'in_progress' => (int) ($matchStatusCounts['in_progress'] ?? 0),
            'completed' => (int) ($matchStatusCounts['completed'] ?? 0),
            'cancelled' => (int) ($matchStatusCounts['cancelled'] ?? 0),
        ];

        // ── Tournaments by Type ─────────────────────────────────────────────
        $tournamentsByType = Tournament::query()
            ->selectRaw('tournament_type, COUNT(*) as cnt')
            ->groupBy('tournament_type')
            ->orderByDesc('cnt')
            ->get()
            ->map(fn ($r) => [
                'type' => $r->tournament_type,
                'label' => $this->tournamentTypeLabel($r->tournament_type),
                'count' => (int) $r->cnt,
            ])
            ->values()
            ->all();

        // ── Matches by Cricket Format (quick matches + match-level format) ─
        $matchesByFormat = DB::table('matches')
            ->whereNotNull('cricket_format')
            ->selectRaw('cricket_format, COUNT(*) as cnt')
            ->groupBy('cricket_format')
            ->orderByDesc('cnt')
            ->get()
            ->map(fn ($r) => [
                'format' => $r->cricket_format,
                'label' => $this->formatLabel($r->cricket_format),
                'count' => (int) $r->cnt,
            ])
            ->values()
            ->all();

        // ── Top Teams by Wins ─────────────────────────────────────────────────
        $topTeams = DB::table('matches')
            ->join('teams', 'matches.winning_team_id', '=', 'teams.id')
            ->whereNotNull('matches.winning_team_id')
            ->where('matches.status', 'completed')
            ->selectRaw('teams.id, teams.name, teams.logo, COUNT(*) as wins')
            ->groupBy('teams.id', 'teams.name', 'teams.logo')
            ->orderByDesc('wins')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'team_id' => $r->id,
                'name' => $r->name,
                'logo' => $r->logo,
                'wins' => (int) $r->wins,
            ])
            ->values()
            ->all();

        // ── Match Activity — last 30 days (daily counts) ──────────────────────
        $matchActivity = DB::table('matches')
            ->where('created_at', '>=', $thirtyAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as cnt')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $matchDates = [];
        $matchCounts = [];
        for ($i = 29; $i >= 0; $i--) {
            $d = $now->copy()->subDays($i)->format('Y-m-d');
            $matchDates[] = $d;
            $matchCounts[] = (int) ($matchActivity->get($d)?->cnt ?? 0);
        }

        // ── Player / User Growth — last 6 months ─────────────────────────────
        $playerGrowthRaw = DB::table('users')
            ->where('type', 'user')
            ->where('users.created_at', '>=', $sixMonths)
            ->selectRaw("TO_CHAR(users.created_at, 'YYYY-MM') as month, COUNT(*) as cnt")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $playerGrowthCounts = [];
        $playerGrowthLabels = [];
        for ($i = 5; $i >= 0; $i--) {
            $key = $now->copy()->subMonths($i)->format('Y-m');
            $label = $now->copy()->subMonths($i)->format('M');
            $playerGrowthLabels[] = $label;
            $playerGrowthCounts[] = (int) ($playerGrowthRaw->get($key)?->cnt ?? 0);
        }

        // ── Tournaments Created — last 6 months (monthly) ────────────────────
        $tournamentsCreatedRaw = DB::table('tournaments')
            ->where('created_at', '>=', $sixMonths)
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as cnt")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $tournamentsMonthlyCounts = [];
        $tournamentsMonthlyLabels = [];
        for ($i = 5; $i >= 0; $i--) {
            $key = $now->copy()->subMonths($i)->format('Y-m');
            $label = $now->copy()->subMonths($i)->format('M');
            $tournamentsMonthlyLabels[] = $label;
            $tournamentsMonthlyCounts[] = (int) ($tournamentsCreatedRaw->get($key)?->cnt ?? 0);
        }

        // ── Active platform breakdown (app users) ─────────────────────────────
        $appUsersTotal = (int) DB::table('users')->where('type', 'user')->count();

        $platformCountsRaw = DB::table('users')
            ->where('type', 'user')
            ->whereNotNull('active_platform')
            ->selectRaw('active_platform, COUNT(*) as cnt')
            ->groupBy('active_platform')
            ->pluck('cnt', 'active_platform')
            ->all();

        $usersWithPlatformTotal = array_sum(array_map('intval', $platformCountsRaw));
        $usersUntrackedTotal = max(0, $appUsersTotal - $usersWithPlatformTotal);

        $usersByActivePlatform = array_map(
            fn (ActivePlatformEnum $platform) => [
                'platform' => $platform->value,
                'label' => $platform->label(),
                'count' => $platform === ActivePlatformEnum::UNTRACKED
                    ? $usersUntrackedTotal
                    : (int) ($platformCountsRaw[$platform->value] ?? 0),
            ],
            ActivePlatformEnum::cases(),
        );

        // ── Live Matches ──────────────────────────────────────────────────────
        $liveMatches = TournamentMatch::query()
            ->where('status', 'in_progress')
            ->with([
                'tournament:id,tournament_name',
                'homeTeam:id,name,logo',
                'awayTeam:id,name,logo',
            ])
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'tournament_name' => $m->tournament?->tournament_name,
                'home_team' => $m->homeTeam?->name,
                'away_team' => $m->awayTeam?->name,
                'home_logo' => $m->homeTeam?->logo,
                'away_logo' => $m->awayTeam?->logo,
                'match_date' => $m->match_date?->toDateString(),
                'overs' => $m->overs,
            ])
            ->values()
            ->all();

        // ── Recent Completed Matches ──────────────────────────────────────────
        $recentMatches = TournamentMatch::query()
            ->where('status', 'completed')
            ->with([
                'tournament:id,tournament_name',
                'homeTeam:id,name,logo',
                'awayTeam:id,name,logo',
                'winningTeam:id,name',
            ])
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'tournament_name' => $m->tournament?->tournament_name,
                'home_team' => $m->homeTeam?->name,
                'away_team' => $m->awayTeam?->name,
                'winner' => $m->winningTeam?->name,
                'win_by_runs' => $m->win_by_runs,
                'win_by_wickets' => $m->win_by_wickets,
                'is_no_result' => (bool) $m->is_no_result,
                'match_date' => $m->match_date?->toDateString(),
                'overs' => $m->overs,
            ])
            ->values()
            ->all();

        // ── Recent Tournaments ────────────────────────────────────────────────
        $recentTournaments = Tournament::query()
            ->with(['organizer:id,name,nickname'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tournament_name' => $t->tournament_name,
                'type_label' => $this->tournamentTypeLabel($t->tournament_type),
                'organizer_name' => $t->organizer?->nickname ?? $t->organizer?->name,
                'status' => $t->status?->value,
                'status_label' => $t->status?->label(),
                'created_at' => $t->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        return [
            // KPIs
            'tournaments_total' => $tournamentsTotal,
            'tournaments_active' => $tournamentsActive,
            'matches_total' => $matchesTotal,
            'matches_completed' => $matchesCompleted,
            'teams_total' => $teamsTotal,
            'players_total' => $playersTotal,

            // Phase breakdown
            'phase_counts' => [
                'upcoming' => $phaseUpcoming,
                'live' => $phaseLive,
                'completed' => $phaseCompleted,
            ],

            // Match status breakdown
            'match_status_counts' => $matchStatus,

            // Type breakdown
            'tournaments_by_type' => $tournamentsByType,
            'matches_by_format' => $matchesByFormat,

            // Top teams
            'top_teams_by_wins' => $topTeams,

            // Match activity (last 30d)
            'match_activity_dates' => $matchDates,
            'match_activity_counts' => $matchCounts,

            // Player growth (last 6 months)
            'player_growth_labels' => $playerGrowthLabels,
            'player_growth_counts' => $playerGrowthCounts,

            // Tournaments created trend (last 6 months)
            'tournaments_monthly_labels' => $tournamentsMonthlyLabels,
            'tournaments_monthly_counts' => $tournamentsMonthlyCounts,

            // Active client platform (web / iOS / Android / untracked)
            'users_by_active_platform' => $usersByActivePlatform,
            'users_with_platform_total' => $usersWithPlatformTotal,
            'app_users_total' => $appUsersTotal,

            // Live matches
            'live_matches' => $liveMatches,

            // Recent completed matches
            'recent_matches' => $recentMatches,

            // Recent tournaments
            'recent_tournaments' => $recentTournaments,
        ];
    }

    private function tournamentTypeLabel(mixed $value): string
    {
        if ($value instanceof \BackedEnum) {
            return method_exists($value, 'label') ? $value->label() : ucwords(str_replace('_', ' ', $value->value));
        }

        return ucwords(str_replace('_', ' ', (string) $value));
    }

    private function formatLabel(mixed $value): string
    {
        if ($value === null) {
            return 'Unknown';
        }
        $map = [
            'hard_ball' => 'Hard Ball',
            'tape_ball' => 'Tape Ball',
            'tennis_ball' => 'Tennis Ball',
            'hard_tennis' => 'Hard Tennis',
        ];

        return $map[$value instanceof \BackedEnum ? $value->value : (string) $value] ?? ucwords(str_replace('_', ' ', (string) $value));
    }
}
