import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export type PostStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'rejected' | 'removed';
export type PostVisibility = 'public' | 'followers' | 'private';
export type PostType = 'text' | 'image' | 'video' | 'repost';

export interface PostPlayback {
  type: string;
  url: string | null;
  poster_url: string | null;
  hls_url: string | null;
  original_url: string | null;
  is_processed: boolean;
}

export interface PostMediaItem {
  id: number;
  kind: string;
  url: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export interface PostCounts {
  likes: number;
  comments: number;
  views: number;
  saves: number;
  shares: number;
  reposts?: number;
  reports: number;
}

export interface PostCreator {
  id: number;
  name: string;
  nickname: string | null;
  avatar_url: string | null;
  is_official?: boolean;
}

export interface AdminPost {
  id: number;
  user_id: number;
  type: PostType;
  title?: string | null;
  body?: string | null;
  caption: string | null;
  background_id?: string | null;
  status: PostStatus;
  visibility: PostVisibility;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  processing_error: string | null;
  cover_url?: string | null;
  media?: PostMediaItem[];
  playback?: PostPlayback | null;
  counts: PostCounts;
  creator?: PostCreator | null;
  ready_at?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PostsListResponse {
  data: AdminPost[];
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

export interface UpdatePostPayload {
  status?: PostStatus;
  visibility?: PostVisibility;
  caption?: string | null;
  body?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/posts';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<PostsListResponse> {
    return this.http.get<PostsListResponse>(this.baseUrl, {
      params: toHttpParams(params),
    });
  }

  public getById(id: number): Observable<{ data: AdminPost }> {
    return this.http.get<{ data: AdminPost }>(`${this.baseUrl}/${id}`);
  }

  public update(id: number, payload: UpdatePostPayload): Observable<{ data: AdminPost }> {
    return this.http.patch<{ data: AdminPost }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Post updated successfully.');
      })
    );
  }

  public reprocess(id: number): Observable<{ data: AdminPost }> {
    return this.http.post<{ data: AdminPost }>(`${this.baseUrl}/${id}/reprocess`, {}).pipe(
      tap(() => {
        this.messageService.success('Video reprocessing queued.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('Post removed successfully.');
      })
    );
  }
}
