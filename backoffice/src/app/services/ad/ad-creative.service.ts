import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export type AdCreativeStatus = 'pending_review' | 'approved' | 'rejected' | 'paused';
export type AdCreativeCtaType = 'url' | 'deep_link' | 'whatsapp';

export interface AdCreative {
  id: number;
  campaign_id: number;
  campaign?: { id: number; name: string; status?: string } | null;
  post_id: number;
  name: string;
  headline?: string | null;
  cta_label: string;
  cta_url: string;
  cta_type: AdCreativeCtaType;
  disclosure_label: string;
  status: AdCreativeStatus;
  weight: number;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdCreativesListResponse {
  data: AdCreative[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface AdCreativeSavePayload {
  campaign_id: number;
  post_id: number;
  name: string;
  headline?: string | null;
  cta_label: string;
  cta_url: string;
  cta_type: AdCreativeCtaType;
  disclosure_label?: string | null;
  weight?: number;
}

@Injectable({ providedIn: 'root' })
export class AdCreativeService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/ad-creatives';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<AdCreativesListResponse> {
    return this.http.get<AdCreativesListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: AdCreative }> {
    return this.http.get<{ data: AdCreative }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: AdCreativeSavePayload): Observable<{ data: AdCreative }> {
    return this.http
      .post<{ data: AdCreative }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Creative created successfully.')));
  }

  public update(id: number, payload: Partial<AdCreativeSavePayload>): Observable<{ data: AdCreative }> {
    return this.http
      .patch<{ data: AdCreative }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Creative updated successfully.')));
  }

  public approve(id: number): Observable<{ data: AdCreative }> {
    return this.http
      .post<{ data: AdCreative }>(`${this.baseUrl}/${id}/approve`, {})
      .pipe(tap(() => this.messageService.success('Creative approved.')));
  }

  public reject(id: number): Observable<{ data: AdCreative }> {
    return this.http
      .post<{ data: AdCreative }>(`${this.baseUrl}/${id}/reject`, {})
      .pipe(tap(() => this.messageService.success('Creative rejected.')));
  }

  public pause(id: number): Observable<{ data: AdCreative }> {
    return this.http
      .post<{ data: AdCreative }>(`${this.baseUrl}/${id}/pause`, {})
      .pipe(tap(() => this.messageService.success('Creative paused.')));
  }
}
