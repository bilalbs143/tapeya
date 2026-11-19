import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export type BrandPartnerStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface BrandPartnerUser {
  id: number;
  name: string;
  nickname: string | null;
  email: string | null;
  phone?: string | null;
}

export interface BrandPartner {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  logo_url?: string | null;
  logo_path?: string | null;
  user_id: number;
  user?: BrandPartnerUser | null;
  contact_email: string | null;
  status: BrandPartnerStatus;
  shop_brand_id: number | null;
  shop_brand?: { id: number; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface BrandPartnersListResponse {
  data: BrandPartner[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface BrandPartnerSavePayload {
  name: string;
  slug?: string | null;
  user_id: number;
  contact_email?: string | null;
  status: BrandPartnerStatus;
  shop_brand_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class BrandPartnerService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/brand-partners';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<BrandPartnersListResponse> {
    return this.http.get<BrandPartnersListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: BrandPartner }> {
    return this.http.get<{ data: BrandPartner }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: BrandPartnerSavePayload): Observable<{ data: BrandPartner }> {
    return this.http
      .post<{ data: BrandPartner }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Brand partner created successfully.')));
  }

  public update(id: number, payload: Partial<BrandPartnerSavePayload>): Observable<{ data: BrandPartner }> {
    return this.http
      .patch<{ data: BrandPartner }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Brand partner updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Brand partner deleted successfully.')));
  }
}
