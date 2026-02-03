import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SoundSettingsService {
  private http = inject(HttpClient);

  public create(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/sound-settings`, data);
  }

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/sound-settings`, {
      params: data,
    });
  }

  public types(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/sound-settings/types`, {});
  }

  public update(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/sound-settings/${id}`, data);
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/sound-settings/${id}`, {});
  }
}
