import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export type PushNotificationStatus = 'queued' | 'processing' | 'sent' | 'partial' | 'failed';
export type PushTriggeredBy = 'system' | 'admin';
export type PushTargetType = 'all' | 'user';

export interface PushNotificationLog {
  id: number;
  template_key: string | null;
  title: string;
  body: string;
  data: Record<string, string> | null;
  image_url: string | null;
  target_type: PushTargetType;
  target_type_label: string;
  target_user_id: number | null;
  target_user?: { id: number; name: string } | null;
  triggered_by: PushTriggeredBy;
  triggered_by_label: string;
  sent_by_user_id: number | null;
  sent_by_user?: { id: number; name: string } | null;
  status: PushNotificationStatus;
  status_label: string;
  total_tokens: number;
  success_count: number;
  failure_count: number;
  provider: string;
  error_message: string | null;
  queued_at: string | null;
  sent_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PushNotificationsListResponse {
  data: PushNotificationLog[];
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

export interface SendPushNotificationPayload {
  title: string;
  body: string;
  image_url?: string | null;
}

export interface PushNotificationTemplate {
  id: number;
  key: string;
  name: string;
  title_template: string;
  body_template: string;
  available_variables: string[];
  sample_preview_data: Record<string, string>;
  is_active: boolean;
  is_editable: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PushNotificationTemplatesListResponse {
  data: PushNotificationTemplate[];
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

export interface UpdatePushNotificationTemplatePayload {
  title_template?: string;
  body_template?: string;
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/push-notifications';
  private readonly templatesUrl = 'v1/admin/push-notification-templates';

  public getList(params: Partial<ListParams> = {}): Observable<PushNotificationsListResponse> {
    return this.http.get<PushNotificationsListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: PushNotificationLog }> {
    return this.http.get<{ data: PushNotificationLog }>(`${this.baseUrl}/${id}`);
  }

  public send(payload: SendPushNotificationPayload): Observable<{ data: PushNotificationLog }> {
    return this.http.post<{ data: PushNotificationLog }>(`${this.baseUrl}/send`, payload).pipe(
      tap(() => {
        this.messageService.success('Push notification queued for delivery.');
      })
    );
  }

  public getTemplates(params: Partial<ListParams> = {}): Observable<PushNotificationTemplatesListResponse> {
    return this.http.get<PushNotificationTemplatesListResponse>(this.templatesUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getTemplateById(id: number): Observable<{ data: PushNotificationTemplate }> {
    return this.http.get<{ data: PushNotificationTemplate }>(`${this.templatesUrl}/${id}`);
  }

  public updateTemplate(
    id: number,
    payload: UpdatePushNotificationTemplatePayload
  ): Observable<{ data: PushNotificationTemplate }> {
    return this.http.patch<{ data: PushNotificationTemplate }>(`${this.templatesUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Push notification template updated.');
      })
    );
  }
}
