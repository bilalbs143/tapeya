import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export type HighlightVideoSource = 'youtube' | 'upload';

export interface Highlight {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  video_source: HighlightVideoSource;
  /** YouTube embed URL or uploaded file URL, depending on video_source */
  video: string | null;
  duration: string | null;
  tournament_id: number | null;
  tournament: { id: number; tournament_name: string } | null;
  is_active: boolean;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  shares_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface HighlightsListResponse {
  data: Highlight[];
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

export interface SaveHighlightPayload {
  title: string;
  description?: string | null;
  video_source: HighlightVideoSource;
  /** YouTube embed URL when video_source is youtube */
  video?: string | null;
  duration?: string | null;
  tournament_id?: number | null;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class HighlightService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/highlights';

  public getList(params: Partial<ListParams> = {}): Observable<HighlightsListResponse> {
    return this.http.get<HighlightsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Highlight }> {
    return this.http.get<{ data: Highlight }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: SaveHighlightPayload): Observable<{ data: Highlight }> {
    return this.http.post<{ data: Highlight }>(this.baseUrl, payload).pipe(
      tap(() => {
        this.messageService.success('Highlight created successfully.');
      })
    );
  }

  public update(id: number, payload: Partial<SaveHighlightPayload>): Observable<{ data: Highlight }> {
    return this.http.patch<{ data: Highlight }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Highlight updated successfully.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('Highlight deleted successfully.');
      })
    );
  }
}
