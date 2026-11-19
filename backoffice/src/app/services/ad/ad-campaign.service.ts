import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export type AdCampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';
export type AdCampaignSurface = 'home_feed' | 'reels_feed';

export interface AdCampaignTargeting {
  platforms?: string[];
  countries?: string[];
}

export interface AdCampaign {
  id: number;
  brand_partner_id: number;
  brand_partner?: { id: number; name: string; status?: string } | null;
  name: string;
  status: AdCampaignStatus;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
  surfaces: AdCampaignSurface[];
  slot_every_n: number | null;
  max_ads_per_response: number | null;
  targeting_json: AdCampaignTargeting | null;
  budget_notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdCampaignsListResponse {
  data: AdCampaign[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface AdCampaignSavePayload {
  brand_partner_id: number;
  name: string;
  status: AdCampaignStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  priority?: number;
  surfaces: AdCampaignSurface[];
  slot_every_n?: number | null;
  max_ads_per_response?: number | null;
  targeting_json?: AdCampaignTargeting | null;
  budget_notes?: string | null;
}

export interface AdCampaignEligibilityPreview {
  servable: boolean;
  reasons: string[];
  would_select_creative_id: number | null;
}

export interface AdCampaignStats {
  impressions?: number;
  views?: number;
  clicks?: number;
  ctr?: number;
  vtr?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdCampaignService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/ad-campaigns';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<AdCampaignsListResponse> {
    return this.http.get<AdCampaignsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: AdCampaign }> {
    return this.http.get<{ data: AdCampaign }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: AdCampaignSavePayload): Observable<{ data: AdCampaign }> {
    return this.http
      .post<{ data: AdCampaign }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Campaign created successfully.')));
  }

  public update(id: number, payload: Partial<AdCampaignSavePayload>): Observable<{ data: AdCampaign }> {
    return this.http
      .patch<{ data: AdCampaign }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Campaign updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Campaign deleted successfully.')));
  }

  public eligibilityPreview(
    id: number,
    params: { user_id: number; surface: string; platform?: string; country?: string; at?: string }
  ): Observable<{ data: AdCampaignEligibilityPreview } | AdCampaignEligibilityPreview> {
    return this.http.get<{ data: AdCampaignEligibilityPreview } | AdCampaignEligibilityPreview>(
      `${this.baseUrl}/${id}/eligibility-preview`,
      { params: toHttpParams(params as Record<string, unknown>) }
    );
  }

  public stats(id: number, params: { from?: string; to?: string } = {}): Observable<{ data: AdCampaignStats } | AdCampaignStats> {
    return this.http.get<{ data: AdCampaignStats } | AdCampaignStats>(`${this.baseUrl}/${id}/stats`, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }
}
