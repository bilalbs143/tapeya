import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export type DramaVideoSource = 'youtube' | 'upload';

export interface DramaEpisode {
  id: number;
  drama_serial_id: number;
  serial: { id: number; title: string } | null;
  episode_number: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  video_source: DramaVideoSource;
  video: string | null;
  /** @deprecated Unused in admin; may still appear on older API payloads. */
  duration?: string | null;
  is_active: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DramaEpisodesListResponse {
  data: DramaEpisode[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface SaveDramaEpisodePayload {
  drama_serial_id: number;
  episode_number: number;
  title: string;
  description?: string | null;
  video_source: DramaVideoSource;
  video?: string | null;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class DramaEpisodeService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/drama-episodes';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<DramaEpisodesListResponse> {
    return this.http.get<DramaEpisodesListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: DramaEpisode }> {
    return this.http.get<{ data: DramaEpisode }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: SaveDramaEpisodePayload, opts?: { silent?: boolean }): Observable<{ data: DramaEpisode }> {
    return this.http.post<{ data: DramaEpisode }>(this.baseUrl, payload).pipe(
      tap(() => {
        if (!opts?.silent) {
          this.messageService.success('Episode created successfully.');
        }
      })
    );
  }

  public update(id: number, payload: Partial<SaveDramaEpisodePayload>): Observable<{ data: DramaEpisode }> {
    return this.http
      .patch<{ data: DramaEpisode }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Episode updated successfully.')));
  }

  public delete(id: number, opts?: { silent?: boolean }): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        if (!opts?.silent) {
          this.messageService.success('Episode deleted successfully.');
        }
      })
    );
  }
}
