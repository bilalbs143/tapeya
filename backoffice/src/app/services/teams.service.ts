import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import type { UserSearchRow } from './users.service';

/** App user row for sponsor / icon player pickers (same payload as admin user search). */
export type TeamUserCandidate = UserSearchRow;

export interface TeamRow {
  id: number;
  name: string;
  code: string;
  country: string;
  city: string;
  logo?: string | null;
  sponsor_id: number;
  sponsor?: TeamUserCandidate | null;
  creator?: TeamUserCandidate | null;
  icon_player_ids: number[];
  icon_players?: TeamUserCandidate[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TeamsListResponse {
  data: TeamRow[];
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

export interface TeamSavePayload {
  name: string;
  code: string;
  country: string;
  city: string;
  sponsor_user_id: number;
  icon_player_ids: number[];
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'v1/admin/teams';

  public getList(params: ListParams | Record<string, unknown> = {}): Observable<TeamsListResponse> {
    return this.http.get<TeamsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: TeamRow }> {
    return this.http.get<{ data: TeamRow }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: TeamSavePayload): Observable<{ data: TeamRow }> {
    return this.http.post<{ data: TeamRow }>(this.baseUrl, payload);
  }

  public update(id: number, payload: TeamSavePayload): Observable<{ data: TeamRow }> {
    return this.http.patch<{ data: TeamRow }>(`${this.baseUrl}/${id}`, payload);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
