import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettlementsManagementService {
  private http = inject(HttpClient);

  public daily(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/settlements/daily/get`, {
      params: data,
    });
  }

  public monthly(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/settlements/monthly/get`, {
      params: data,
    });
  }
}
