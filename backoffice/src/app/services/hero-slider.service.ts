import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface HeroSlider {
  id: number;
  image_mobile: string | null;
  image_desktop: string | null;
  status: string;
  status_enum: string;
  created_at?: string;
  updated_at?: string;
}

export interface HeroSlidersListResponse {
  data: HeroSlider[];
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

export interface HeroSliderSavePayload {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class HeroSliderService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/hero-sliders';

  public getList(params: Partial<ListParams> = {}): Observable<HeroSlidersListResponse> {
    return this.http.get<HeroSlidersListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: HeroSlider }> {
    return this.http.get<{ data: HeroSlider }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: HeroSliderSavePayload): Observable<{ data: HeroSlider }> {
    return this.http.post<{ data: HeroSlider }>(this.baseUrl, payload).pipe(
      tap(() => {
        this.messageService.success('Hero slider created successfully.');
      })
    );
  }

  public update(id: number, payload: HeroSliderSavePayload): Observable<{ data: HeroSlider }> {
    return this.http.put<{ data: HeroSlider }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Hero slider updated successfully.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('Hero slider deleted successfully.');
      })
    );
  }
}
