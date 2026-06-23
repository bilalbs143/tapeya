/** Cricket dashboard stats returned by GET v1/admin/cricket/dashboard-stats */

export interface CricketDashboardStats {
  // KPIs
  tournaments_total: number;
  tournaments_active: number;
  matches_total: number;
  matches_completed: number;
  teams_total: number;
  players_total: number;

  // Tournament phase breakdown
  phase_counts: {
    upcoming: number;
    live: number;
    completed: number;
  };

  // Match status breakdown
  match_status_counts: {
    scheduled: number;
    toss_done: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };

  // Format breakdowns
  tournaments_by_format: CricketFormatCount[];
  matches_by_format: CricketFormatCount[];

  // Top teams
  top_teams_by_wins: TopTeamRow[];

  // Match activity (last 30 days)
  match_activity_dates: string[];
  match_activity_counts: number[];

  // Player growth (last 6 months)
  player_growth_labels: string[];
  player_growth_counts: number[];

  // Tournament requests trend (last 6 months)
  requests_monthly_labels: string[];
  requests_monthly_counts: number[];

  // Request pipeline
  request_pipeline: {
    pending: number;
    approved: number;
    rejected: number;
  };

  // Active client platform breakdown
  users_by_active_platform: ActivePlatformCount[];
  users_with_platform_total: number;
  app_users_total: number;

  // Live matches
  live_matches: LiveMatchRow[];

  // Recent completed matches
  recent_matches: RecentMatchRow[];

  // Recent tournament requests
  recent_tournament_requests: RecentTournamentRequestRow[];
}

export interface CricketFormatCount {
  format: string;
  label: string;
  count: number;
}

export interface ActivePlatformCount {
  platform: 'web' | 'ios' | 'android' | 'untracked';
  label: string;
  count: number;
}

export interface TopTeamRow {
  team_id: number;
  name: string;
  logo: string | null;
  wins: number;
}

export interface LiveMatchRow {
  id: number;
  tournament_name: string | null;
  home_team: string | null;
  away_team: string | null;
  home_logo: string | null;
  away_logo: string | null;
  match_date: string | null;
  overs: number | null;
}

export interface RecentMatchRow {
  id: number;
  tournament_name: string | null;
  home_team: string | null;
  away_team: string | null;
  winner: string | null;
  win_by_runs: number | null;
  win_by_wickets: number | null;
  is_no_result: boolean;
  match_date: string | null;
  overs: number | null;
}

export interface RecentTournamentRequestRow {
  id: number;
  tournament_name: string | null;
  status: string | null;
  status_label: string | null;
  user_name: string;
  cricket_format: string | null;
  format_label: string | null;
  created_at: string | null;
}

export interface CricketDashboardResponse {
  data: CricketDashboardStats;
}
