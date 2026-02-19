import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface EventRequest {
  id: number;
  user_id: number | null;
  user?: { id: number; name: string; email: string | null; phone: string | null };
  contact_person_name: string;
  contact_phone: string;
  event_name: string;
  event_type: string;
  event_type_label: string;
  cricket_format: string;
  cricket_format_label: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  number_of_matches: number;
  number_of_teams: number;
  expected_players_count: number;
  city: string;
  match_timings: string;
  match_timings_label: string;
  status: string;
  status_label: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventRequestsListResponse {
  data: EventRequest[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

@Injectable({ providedIn: 'root' })
export class EventRequestService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/event-requests';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<EventRequestsListResponse> {
    return this.http.get<EventRequestsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: EventRequest }> {
    return this.http.get<{ data: EventRequest }>(`${this.baseUrl}/${id}`);
  }

  public updateStatus(id: number, status: string): Observable<{ data: EventRequest }> {
    return this.http
      .patch<{ data: EventRequest }>(`${this.baseUrl}/${id}`, { status })
      .pipe(tap(() => this.messageService.success('Event request status updated successfully.')));
  }
}
