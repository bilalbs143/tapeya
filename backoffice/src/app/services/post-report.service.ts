import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';
import type { PostStatus, PostType, PostVisibility } from './post.service';

export type PostReportStatus = 'open' | 'reviewed' | 'dismissed' | 'actioned';
export type PostReportReason = 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'copyright' | 'other';

export interface PostReportPost {
  id: number;
  type?: PostType | null;
  title?: string | null;
  body?: string | null;
  caption: string | null;
  background_id?: string | null;
  cover_url?: string | null;
  status: PostStatus;
  visibility: PostVisibility;
  reports_count: number;
  user_id: number;
}

export interface PostReportReporter {
  id: number;
  name: string;
  nickname: string | null;
}

export interface PostReport {
  id: number;
  post_id: number;
  reporter_id: number;
  reason: PostReportReason;
  details: string | null;
  status: PostReportStatus;
  post?: PostReportPost | null;
  reporter?: PostReportReporter | null;
  created_at?: string;
  updated_at?: string;
}

export interface PostReportsListResponse {
  data: PostReport[];
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

export interface UpdatePostReportPayload {
  status: PostReportStatus;
}

@Injectable({ providedIn: 'root' })
export class PostReportService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/post-reports';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<PostReportsListResponse> {
    return this.http.get<PostReportsListResponse>(this.baseUrl, {
      params: toHttpParams(params),
    });
  }

  public getById(id: number): Observable<{ data: PostReport }> {
    return this.http.get<{ data: PostReport }>(`${this.baseUrl}/${id}`);
  }

  public update(id: number, payload: UpdatePostReportPayload): Observable<{ data: PostReport }> {
    return this.http.patch<{ data: PostReport }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Post report updated successfully.');
      })
    );
  }
}
