import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StaticPagesListResponse {
  data: StaticPage[];
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

export interface SaveStaticPagePayload {
  title: string;
  slug: string;
  content: string | null;
}

@Injectable({ providedIn: 'root' })
export class StaticPageService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/static-pages';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<StaticPagesListResponse> {
    return this.http.get<StaticPagesListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: StaticPage }> {
    return this.http.get<{ data: StaticPage }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: SaveStaticPagePayload): Observable<{ data: StaticPage }> {
    return this.http.post<{ data: StaticPage }>(this.baseUrl, payload).pipe(
      tap(() => {
        this.messageService.success('Static page created successfully.');
      })
    );
  }

  public update(id: number, payload: SaveStaticPagePayload): Observable<{ data: StaticPage }> {
    return this.http.put<{ data: StaticPage }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Static page updated successfully.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('Static page deleted successfully.');
      })
    );
  }
}
