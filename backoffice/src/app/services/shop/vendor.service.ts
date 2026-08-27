import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export interface VendorUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Vendor {
  id: number;
  store_name: string;
  slug: string;
  description: string | null;
  status: string;
  status_label?: string | null;
  commission_rate: number | null;
  default_shipping_amount: number;
  is_platform: boolean;
  user_id: number;
  user?: VendorUser | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  approved_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VendorsListResponse {
  data: Vendor[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface VendorSavePayload {
  user_id: number;
  store_name: string;
  slug?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  status?: 'pending' | 'approved' | null;
  commission_rate?: number | null;
  default_shipping_amount?: number | null;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/shop/vendors';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<VendorsListResponse> {
    return this.http.get<VendorsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Vendor }> {
    return this.http.get<{ data: Vendor }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: VendorSavePayload): Observable<{ data: Vendor }> {
    return this.http
      .post<{ data: Vendor }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Vendor created successfully.')));
  }

  public update(id: number, payload: VendorSavePayload): Observable<{ data: Vendor }> {
    return this.http
      .put<{ data: Vendor }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Vendor updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Vendor deleted successfully.')));
  }

  public approve(id: number): Observable<{ data: Vendor }> {
    return this.http
      .post<{ data: Vendor }>(`${this.baseUrl}/${id}/approve`, {})
      .pipe(tap(() => this.messageService.success('Vendor approved successfully.')));
  }

  public suspend(id: number, payload: { suspension_reason?: string | null } = {}): Observable<{ data: Vendor }> {
    return this.http
      .post<{ data: Vendor }>(`${this.baseUrl}/${id}/suspend`, payload)
      .pipe(tap(() => this.messageService.success('Vendor suspended successfully.')));
  }

  public reject(id: number, payload: { rejection_reason?: string | null } = {}): Observable<{ data: Vendor }> {
    return this.http
      .post<{ data: Vendor }>(`${this.baseUrl}/${id}/reject`, payload)
      .pipe(tap(() => this.messageService.success('Vendor rejected successfully.')));
  }
}
