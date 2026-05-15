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

  public create(formData: FormData): Observable<{ data: TeamRow }> {
    return this.http.post<{ data: TeamRow }>(this.baseUrl, formData);
  }

  public update(id: number, formData: FormData): Observable<{ data: TeamRow }> {
    formData.append('_method', 'PATCH');
    return this.http.post<{ data: TeamRow }>(`${this.baseUrl}/${id}`, formData);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
