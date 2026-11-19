import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export type LiveAdTakeMode = 'overlay' | 'break';
export type LiveAdTakeStatus = 'draft' | 'live' | 'ended' | 'cancelled';

export interface LiveAdTakeStream {
  id: number;
  title: string | null;
  status?: string;
}

export interface LiveAdTake {
  id: number;
  creative_id: number;
  creative?: { id: number; name: string; status?: string; campaign_id?: number } | null;
  campaign_id?: number | null;
  mode: LiveAdTakeMode;
  status: LiveAdTakeStatus;
  stream_ids?: number[];
  streams?: LiveAdTakeStream[];
  note?: string | null;
  presentation?: Record<string, unknown> | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LiveAdTakesListResponse {
  data: LiveAdTake[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface CreateLiveAdTakePayload {
  creative_id: number;
  mode: LiveAdTakeMode;
  stream_ids: number[];
  replace?: boolean;
  note?: string | null;
  presentation?: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class LiveAdTakeService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/live-ad-takes';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<LiveAdTakesListResponse> {
    return this.http.get<LiveAdTakesListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public create(payload: CreateLiveAdTakePayload): Observable<{ data: LiveAdTake }> {
    return this.http
      .post<{ data: LiveAdTake }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Ad take is now live.')));
  }

  public end(id: number): Observable<{ data: LiveAdTake }> {
    return this.http
      .post<{ data: LiveAdTake }>(`${this.baseUrl}/${id}/end`, {})
      .pipe(tap(() => this.messageService.success('Ad take ended.')));
  }

  public endAll(payload: { stream_id?: number } = {}): Observable<{ data?: unknown }> {
    return this.http
      .post<{ data?: unknown }>(`${this.baseUrl}/end-all`, payload)
      .pipe(tap(() => this.messageService.success('All ad takes ended.')));
  }
}
