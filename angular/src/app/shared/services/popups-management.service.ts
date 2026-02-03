import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PopupsManagementService {
  private http = inject(HttpClient);

  public create(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/popups`, data);
  }

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/popups`, {
      params: data,
    });
  }

  public update(data: any, id: number): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/popups/${id}?_method=PATCH`, data);
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/popups/${id}`, {});
  }
}
