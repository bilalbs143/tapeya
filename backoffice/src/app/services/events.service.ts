import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface Event {
  id: number;
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
  country?: string | null;
  city: string;
  match_timings: string;
  match_timings_label: string;
  status: string;
  status_enum?: string;
  status_label?: string;
  display_image?: string | null;
  cover_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EventsListResponse {
  data: Event[];
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
export class EventsService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/events';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<EventsListResponse> {
    return this.http.get<EventsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Event }> {
    return this.http.get<{ data: Event }>(`${this.baseUrl}/${id}`);
  }

  public create(formData: FormData): Observable<{ data: Event }> {
    return this.http.post<{ data: Event }>(this.baseUrl, formData).pipe(
      tap(() => {
        this.messageService.success('Event created successfully.');
      })
    );
  }

  public update(id: number, formData: FormData): Observable<{ data: Event }> {
    return this.http.patch<{ data: Event }>(`${this.baseUrl}/${id}`, formData).pipe(
      tap(() => {
        this.messageService.success('Event updated successfully.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('Event deleted successfully.');
      })
    );
  }
}
