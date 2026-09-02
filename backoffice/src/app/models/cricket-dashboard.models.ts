/** Cricket dashboard stats returned by GET v1/admin/cricket/dashboard-stats */

export interface CricketDashboardStats {
  tournaments_total: number;
  tournaments_active: number;
  matches_total: number;
  matches_completed: number;
  teams_total: number;
  players_total: number;

  phase_counts: {
    upcoming: number;
    live: number;
    completed: number;
  };

  match_status_counts: {
    scheduled: number;
    toss_done: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };

  tournaments_by_type: TournamentTypeCount[];
  matches_by_format: CricketFormatCount[];

  top_teams_by_wins: TopTeamRow[];

  match_activity_dates: string[];
  match_activity_counts: number[];

  player_growth_labels: string[];
  player_growth_counts: number[];

  tournaments_monthly_labels: string[];
  tournaments_monthly_counts: number[];

  users_by_active_platform: ActivePlatformCount[];
  users_with_platform_total: number;
  app_users_total: number;

  live_matches: LiveMatchRow[];
  recent_matches: RecentMatchRow[];
  recent_tournaments: RecentTournamentRow[];
}

export interface TournamentTypeCount {
  type: string;
  label: string;
  count: number;
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

export interface RecentTournamentRow {
  id: number;
  tournament_name: string | null;
  type_label: string | null;
  organizer_name: string | null;
  status: string | null;
  status_label: string | null;
  created_at: string | null;
}

export interface CricketDashboardResponse {
  data: CricketDashboardStats;
}
