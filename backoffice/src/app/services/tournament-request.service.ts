import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface TournamentRequest {
  id: number;
  user_id: number | null;
  user?: { id: number; name: string; nickname?: string | null; email: string | null; phone: string | null };
  contact_person_name: string;
  contact_phone: string;
  tournament_name: string;
  short_name?: string | null;
  tournament_type: string;
  tournament_type_label: string;
  cricket_format: string;
  cricket_format_label: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  number_of_teams: number;
  number_of_groups?: number;
  country?: string | null;
  city: string;
  match_timings: string;
  match_timings_label: string;
  prize?: string | null;
  status: string;
  status_label: string;
  created_at?: string;
  updated_at?: string;
}

export interface TournamentRequestsListResponse {
  data: TournamentRequest[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

@Injectable({ providedIn: 'root' })
export class TournamentRequestService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/tournament-requests';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<TournamentRequestsListResponse> {
    return this.http.get<TournamentRequestsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: TournamentRequest }> {
    return this.http.get<{ data: TournamentRequest }>(`${this.baseUrl}/${id}`);
  }

  public updateStatus(id: number, status: string): Observable<{ data: TournamentRequest }> {
    return this.http
      .patch<{ data: TournamentRequest }>(`${this.baseUrl}/${id}`, { status })
      .pipe(tap(() => this.messageService.success('Tournament request status updated successfully.')));
  }
}
