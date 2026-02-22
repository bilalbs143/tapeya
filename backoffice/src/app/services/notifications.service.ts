import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export interface NotificationData {
  type?: string;
  order_id?: number;
  order_number?: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  customer_name?: string;
  total?: string;
  currency?: string;
  message?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: string | null;
  data: NotificationData;
  read_at: string | null;
  read_by: number | null;
  created_at: string;
}

export interface NotificationsListResponse {
  data: Notification[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    unread_count: number;
  };
  links?: { first: string | null; last: string | null; prev: string | null; next: string | null };
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'v1/admin/notifications';

  public getList(
    params: Partial<ListParams> & Record<string, unknown> = {}
  ): Observable<{ data: Notification[]; meta?: NotificationsListResponse['meta'] }> {
    return this.http.get<NotificationsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public markAsRead(id: string): Observable<{ data: Notification }> {
    return this.http.patch<{ data: Notification }>(`${this.baseUrl}/${id}/read`, {});
  }

  public markAllAsRead(): Observable<{ message?: string }> {
    return this.http.patch<{ message?: string }>(`${this.baseUrl}/read-all`, {});
  }

  public flush(): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(this.baseUrl);
  }
}
