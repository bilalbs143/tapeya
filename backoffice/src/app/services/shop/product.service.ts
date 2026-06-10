import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export interface ProductImage {
  id: number;
  path: string;
  alt: string | null;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  sale_price: number | null;
  sale_percentage: number | null;
  brand_id: number | null;
  brand?: { id: number; name: string; slug: string } | null;
  category_id: number | null;
  category?: { id: number; name: string; slug: string } | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  is_special_offer: boolean;
  discount_type: string | null;
  discount_value: number | null;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductsListResponse {
  data: Product[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface ProductSavePayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  brand_id: number;
  category_id: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  is_special_offer: boolean;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_starts_at?: string | null;
  discount_ends_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/shop/products';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<ProductsListResponse> {
    return this.http.get<ProductsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Product }> {
    return this.http.get<{ data: Product }>(`${this.baseUrl}/${id}`);
  }

  public create(formData: FormData | ProductSavePayload): Observable<{ data: Product }> {
    return this.http
      .post<{ data: Product }>(this.baseUrl, formData)
      .pipe(tap(() => this.messageService.success('Product created successfully.')));
  }

  public update(id: number, formData: ProductSavePayload): Observable<{ data: Product }> {
    return this.http
      .put<{ data: Product }>(`${this.baseUrl}/${id}`, formData)
      .pipe(tap(() => this.messageService.success('Product updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Product deleted successfully.')));
  }
}
