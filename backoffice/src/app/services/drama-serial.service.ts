import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface DramaSerial {
  id: number;
  title: string;
  description: string | null;
  poster: string | null;
  is_active: boolean;
  episodes_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DramaSerialsListResponse {
  data: DramaSerial[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface SaveDramaSerialPayload {
  title: string;
  description?: string | null;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class DramaSerialService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/drama-serials';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<DramaSerialsListResponse> {
    return this.http.get<DramaSerialsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: DramaSerial }> {
    return this.http.get<{ data: DramaSerial }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: SaveDramaSerialPayload): Observable<{ data: DramaSerial }> {
    return this.http
      .post<{ data: DramaSerial }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Drama serial created successfully.')));
  }

  public update(id: number, payload: Partial<SaveDramaSerialPayload>): Observable<{ data: DramaSerial }> {
    return this.http
      .patch<{ data: DramaSerial }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Drama serial updated successfully.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Drama serial deleted successfully.')));
  }
}
