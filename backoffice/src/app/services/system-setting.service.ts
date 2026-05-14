import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';

import { MessageService } from './message.service';

export interface SystemSetting {
  group: string;
  key: string;
  label: string;
  value: string | number | null;
  type: string;
  field_type: 'text' | 'textarea' | 'number' | 'dropdown';
  values?: string[];
  description?: string | null;
}

export interface SystemSettingsListResponse {
  data: SystemSetting[];
}

export interface SystemSettingShowResponse {
  data: SystemSetting;
}

@Injectable({ providedIn: 'root' })
export class SystemSettingService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/system-settings';

  public getAll(): Observable<SystemSettingsListResponse> {
    return this.http.get<SystemSettingsListResponse>(this.baseUrl, {
      params: toHttpParams({ all: 1 }),
    });
  }

  public patch(key: string, value: string | number | null): Observable<SystemSettingShowResponse> {
    return this.http.patch<SystemSettingShowResponse>(`${this.baseUrl}/${key}`, { value }).pipe(
      tap(() => {
        this.messageService.success('Setting Saved.');
      })
    );
  }
}
