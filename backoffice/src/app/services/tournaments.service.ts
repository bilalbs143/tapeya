import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';
import type { UserSearchRow } from './users.service';

export interface Tournament {
  id: number;
  organizer_id: number;
  created_by?: number | null;
  creator?: { id: number; name: string; nickname: string | null; email: string | null; phone: string | null } | null;
  organizer?: { id: number; name: string; nickname: string | null; email: string | null; phone: string | null };
  tournament_name: string;
  tournament_type: string;
  tournament_type_label: string;
  cricket_format: string;
  cricket_format_label: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  number_of_teams: number;
  squad_player_count?: number;
  number_of_groups?: number;
  country?: string | null;
  city: string;
  match_timings: string;
  match_timings_label: string;
  status: string;
  status_enum?: string;
  status_label?: string;
  schedule_phase?: string | null;
  schedule_phase_label?: string | null;
  display_image?: string | null;
  cover_image?: string | null;
  prize?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TournamentsListResponse {
  data: Tournament[];
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
export class TournamentsService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/tournaments';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<TournamentsListResponse> {
    return this.http.get<TournamentsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Tournament }> {
    return this.http.get<{ data: Tournament }>(`${this.baseUrl}/${id}`);
  }

  public create(formData: FormData): Observable<{ data: Tournament }> {
    return this.http.post<{ data: Tournament }>(this.baseUrl, formData).pipe(
      tap(() => {
        this.messageService.success('Tournament created successfully.');
      })
    );
  }

  public update(id: number, formData: FormData): Observable<{ data: Tournament }> {
    formData.append('_method', 'PATCH');
    return this.http.post<{ data: Tournament }>(`${this.baseUrl}/${id}`, formData).pipe(
      tap(() => {
        this.messageService.success('Tournament updated successfully.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('Tournament deleted successfully.');
      })
    );
  }

  public getBroadcaster(tournamentId: number): Observable<{ data?: UserSearchRow | null }> {
    return this.http.get<{ data?: UserSearchRow | null }>(`${this.baseUrl}/${tournamentId}/broadcaster`);
  }

  public setBroadcaster(tournamentId: number, userId: number): Observable<{ data: UserSearchRow }> {
    return this.http
      .post<{ data: UserSearchRow }>(`${this.baseUrl}/${tournamentId}/broadcaster`, {
        user_id: userId,
      })
      .pipe(
        tap(() => {
          this.messageService.success('Tournament broadcaster updated.');
        })
      );
  }

  public removeBroadcaster(tournamentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tournamentId}/broadcaster`).pipe(
      tap(() => {
        this.messageService.success('Tournament broadcaster removed.');
      })
    );
  }
}
