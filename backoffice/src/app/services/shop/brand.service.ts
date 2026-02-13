import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface BrandsListResponse {
  data: Brand[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string | null;
  logo?: File | null;
  is_active?: boolean;
}

export type UpdateBrandPayload = Omit<CreateBrandPayload, 'logo'> & { logo?: File | null };

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/shop/brands';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<BrandsListResponse> {
    return this.http.get<BrandsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Brand }> {
    return this.http.get<{ data: Brand }>(`${this.baseUrl}/${id}`);
  }

  public create(formData: FormData): Observable<{ data: Brand }> {
    return this.http
      .post<{ data: Brand }>(this.baseUrl, formData)
      .pipe(tap(() => this.messageService.success('Brand created successfully.')));
  }

  public update(id: number, formData: FormData): Observable<{ data: Brand }> {
    formData.append('_method', 'PUT');
    return this.http
      .post<{ data: Brand }>(`${this.baseUrl}/${id}`, formData)
      .pipe(tap(() => this.messageService.success('Brand updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Brand deleted successfully.')));
  }
}
