import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export type UserReportStatus = 'open' | 'reviewed' | 'dismissed' | 'actioned';
export type UserReportReason = 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'copyright' | 'other';
export type UserReportSource = 'report' | 'block';

export interface UserReportPerson {
  id: number;
  name: string;
  nickname: string | null;
  phone?: string | null;
  status?: string | null;
}

export interface UserReport {
  id: number;
  reason: UserReportReason;
  details: string | null;
  source: UserReportSource;
  status: UserReportStatus;
  reporter?: UserReportPerson | null;
  reported_user?: UserReportPerson | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserReportsListResponse {
  data: UserReport[];
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

export interface UpdateUserReportPayload {
  status: UserReportStatus;
}

@Injectable({ providedIn: 'root' })
export class UserReportService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/user-reports';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<UserReportsListResponse> {
    return this.http.get<UserReportsListResponse>(this.baseUrl, {
      params: toHttpParams(params),
    });
  }

  public update(id: number, payload: UpdateUserReportPayload): Observable<{ data: UserReport }> {
    return this.http.patch<{ data: UserReport }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('User report updated successfully.');
      })
    );
  }
}
