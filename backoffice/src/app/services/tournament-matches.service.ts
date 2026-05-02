import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TournamentMatchTeam {
  id: number;
  name: string;
  logo?: string | null;
  code?: string | null;
}

export interface TournamentMatchRow {
  id: number;
  tournament_id: number;
  group_index: number | null;
  match_date: string;
  match_time: string;
  venue_name: string;
  players_per_side: number;
  overs: number;
  status: string;
  status_label?: string;
  home_team_id: number;
  away_team_id: number;
  home_team?: TournamentMatchTeam;
  away_team?: TournamentMatchTeam;
  winning_team_id?: number | null;
  is_no_result?: boolean;
  win_by_runs?: number | null;
  win_by_wickets?: number | null;
  /** Plain-language result when available (completed, no-result, cancelled). */
  result_summary?: string | null;
}

export interface TournamentMatchesListResponse {
  data: TournamentMatchRow[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: Record<string, string | null>;
}

export interface CreateTournamentMatchPayload {
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_time: string;
  venue_name: string;
  players_per_side: number;
  overs: number;
  group_index?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TournamentMatchesService {
  private readonly http = inject(HttpClient);

  public listByTournament(tournamentId: number, all = true): Observable<TournamentMatchesListResponse> {
    const q = all ? '?all=1' : '';
    return this.http.get<TournamentMatchesListResponse>(`v1/admin/tournaments/${tournamentId}/matches${q}`);
  }

  public getById(matchId: number): Observable<{ data: TournamentMatchRow }> {
    return this.http.get<{ data: TournamentMatchRow }>(`v1/admin/matches/${matchId}`);
  }

  public createMatch(
    tournamentId: number,
    body: CreateTournamentMatchPayload
  ): Observable<{ data: TournamentMatchRow }> {
    return this.http.post<{ data: TournamentMatchRow }>(`v1/admin/tournaments/${tournamentId}/matches`, body);
  }
}
