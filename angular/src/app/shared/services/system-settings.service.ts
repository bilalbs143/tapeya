import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private http = inject(HttpClient);

  public getAll(params?: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/system-settings`, {
      params: params || {},
    });
  }

  public get(key: string): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/system-settings/${key}`, {});
  }

  public update(data: any, key: string): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/system-settings/${key}`, data);
  }
}
