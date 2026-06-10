import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  parent?: Category | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesListResponse {
  data: Category[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string | null;
  parent_id?: number | null;
  image?: File | null;
  sort_order?: number;
  is_active?: boolean;
}

export type SaveCategoryPayload = Omit<CreateCategoryPayload, 'image'>;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/shop/categories';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<CategoriesListResponse> {
    return this.http.get<CategoriesListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Category }> {
    return this.http.get<{ data: Category }>(`${this.baseUrl}/${id}`);
  }

  public create(formData: FormData | SaveCategoryPayload): Observable<{ data: Category }> {
    return this.http
      .post<{ data: Category }>(this.baseUrl, formData)
      .pipe(tap(() => this.messageService.success('Category created successfully.')));
  }

  public update(id: number, formData: SaveCategoryPayload): Observable<{ data: Category }> {
    return this.http
      .put<{ data: Category }>(`${this.baseUrl}/${id}`, formData)
      .pipe(tap(() => this.messageService.success('Category updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Category deleted successfully.')));
  }
}
