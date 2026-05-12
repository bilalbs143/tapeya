<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentRequest;
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

        // Players = users with 'player' role (app guard)
        $playersTotal = DB::table('users')
            ->join('role_user', 'users.id', '=', 'role_user.user_id')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('roles.slug', 'player')
            ->where('roles.guard', 'app')
            ->distinct()
            ->count('users.id');

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

        // ── Tournaments by Cricket Format ─────────────────────────────────────
        $tournamentsByFormat = Tournament::query()
            ->selectRaw('cricket_format, COUNT(*) as cnt')
            ->whereNotNull('cricket_format')
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

        // ── Matches by Cricket Format (via tournament join) ───────────────────
        $matchesByFormat = DB::table('matches')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->whereNotNull('tournaments.cricket_format')
            ->selectRaw('tournaments.cricket_format, COUNT(*) as cnt')
            ->groupBy('tournaments.cricket_format')
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
            ->join('role_user', 'users.id', '=', 'role_user.user_id')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('roles.slug', 'player')
            ->where('roles.guard', 'app')
            ->where('users.created_at', '>=', $sixMonths)
            ->selectRaw("TO_CHAR(users.created_at, 'YYYY-MM') as month, COUNT(DISTINCT users.id) as cnt")
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

        // ── Tournament Requests — last 6 months (monthly) ────────────────────
        $requestsRaw = DB::table('tournament_requests')
            ->where('created_at', '>=', $sixMonths)
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as cnt")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $requestsMonthlyCounts = [];
        $requestsMonthlyLabels = [];
        for ($i = 5; $i >= 0; $i--) {
            $key = $now->copy()->subMonths($i)->format('Y-m');
            $label = $now->copy()->subMonths($i)->format('M');
            $requestsMonthlyLabels[] = $label;
            $requestsMonthlyCounts[] = (int) ($requestsRaw->get($key)?->cnt ?? 0);
        }

        // ── Tournament Request Pipeline (by status) ───────────────────────────
        $requestsByStatus = TournamentRequest::query()
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->all();

        $requestPipeline = [
            'pending' => (int) ($requestsByStatus['pending'] ?? 0),
            'approved' => (int) ($requestsByStatus['approved'] ?? 0),
            'rejected' => (int) ($requestsByStatus['rejected'] ?? 0),
        ];

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

        // ── Recent Tournament Requests ────────────────────────────────────────
        $recentRequests = TournamentRequest::query()
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'tournament_name' => $r->tournament_name,
                'status' => $r->status?->value,
                'status_label' => $r->status?->label(),
                'user_name' => $r->user?->name ?? '—',
                'cricket_format' => $r->cricket_format?->value,
                'format_label' => $r->cricket_format?->label(),
                'created_at' => $r->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        return $this->success([
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

            // Format breakdowns
            'tournaments_by_format' => $tournamentsByFormat,
            'matches_by_format' => $matchesByFormat,

            // Top teams
            'top_teams_by_wins' => $topTeams,

            // Match activity (last 30d)
            'match_activity_dates' => $matchDates,
            'match_activity_counts' => $matchCounts,

            // Player growth (last 6 months)
            'player_growth_labels' => $playerGrowthLabels,
            'player_growth_counts' => $playerGrowthCounts,

            // Tournament requests trend (last 6 months)
            'requests_monthly_labels' => $requestsMonthlyLabels,
            'requests_monthly_counts' => $requestsMonthlyCounts,

            // Request pipeline by status
            'request_pipeline' => $requestPipeline,

            // Live matches
            'live_matches' => $liveMatches,

            // Recent completed matches
            'recent_matches' => $recentMatches,

            // Recent tournament requests
            'recent_tournament_requests' => $recentRequests,
        ]);
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
