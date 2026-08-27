import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export type SupportMessageStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportMessageUser {
  id: number;
  name: string;
  nickname: string | null;
}

export interface SupportMessage {
  id: number;
  user_id: number | null;
  name: string;
  phone: string | null;
  message: string;
  attachment_url: string | null;
  status: SupportMessageStatus;
  status_label?: string | null;
  user?: SupportMessageUser | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupportMessagesListResponse {
  data: SupportMessage[];
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

export interface UpdateSupportMessagePayload {
  status: SupportMessageStatus;
}

@Injectable({ providedIn: 'root' })
export class SupportMessageService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/support-messages';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<SupportMessagesListResponse> {
    return this.http.get<SupportMessagesListResponse>(this.baseUrl, {
      params: toHttpParams(params),
    });
  }

  public getById(id: number): Observable<{ data: SupportMessage }> {
    return this.http.get<{ data: SupportMessage }>(`${this.baseUrl}/${id}`);
  }

  public update(id: number, payload: UpdateSupportMessagePayload): Observable<{ data: SupportMessage }> {
    return this.http.patch<{ data: SupportMessage }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Support message updated successfully.');
      })
    );
  }
}
