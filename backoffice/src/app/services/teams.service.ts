import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import type { UserSearchRow } from './users.service';

/** App user row for team owner picker. */
export type TeamUserCandidate = UserSearchRow;

export interface TeamRow {
  id: number;
  name: string;
  code: string;
  country: string;
  city: string;
  logo?: string | null;
  /** Free-text; comma-separated when multiple. */
  sponsor?: string | null;
  /** Free-text; comma-separated when multiple. */
  icon_players?: string | null;
  owner_id: number;
  owner?: TeamUserCandidate | null;
  creator?: TeamUserCandidate | null;
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
  sponsor?: string | null;
  icon_players?: string | null;
  owner_user_id: number;
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
