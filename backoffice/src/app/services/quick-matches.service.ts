import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';

export interface QuickMatchCreator {
  id: number;
  name: string;
}

export interface QuickMatchPlayer {
  id: number;
  name: string | null;
  nickname: string | null;
  added_via_quick_match: boolean;
}

export interface QuickMatchSide {
  id: number;
  name: string;
  user_id: number | null;
  logo: string | null;
  players: QuickMatchPlayer[];
}

export interface QuickMatchRow {
  id: number;
  kind: string;
  status: string;
  status_label: string;
  cricket_format: string | null;
  cricket_format_label: string | null;
  overs: number | null;
  players_per_side: number | null;
  venue_name: string | null;
  match_date: string | null;
  match_time: string | null;
  created_by: QuickMatchCreator | null;
  home_team: QuickMatchSide | null;
  away_team: QuickMatchSide | null;
  toss_winner_team_id: number | null;
  chose_to_bat_or_bowl: string | null;
  cancel_reason: string | null;
  cancel_comments: string | null;
  result_summary: string | null;
}

export interface QuickMatchesListResponse {
  data: QuickMatchRow[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface QuickMatchListParams {
  page?: number;
  per_page?: number;
  status?: string;
  q?: string;
  created_by?: number | string;
  from_date?: string;
  to_date?: string;
}

@Injectable({ providedIn: 'root' })
export class QuickMatchesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'v1/admin/quick-matches';

  public getList(params: QuickMatchListParams = {}): Observable<QuickMatchesListResponse> {
    return this.http.get<QuickMatchesListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: QuickMatchRow }> {
    return this.http.get<{ data: QuickMatchRow }>(`${this.baseUrl}/${id}`);
  }

  public cancel(id: number, comments?: string): Observable<{ data: QuickMatchRow; message?: string }> {
    return this.http.post<{ data: QuickMatchRow; message?: string }>(`${this.baseUrl}/${id}/cancel`, {
      comments: comments ?? undefined,
    });
  }
}
