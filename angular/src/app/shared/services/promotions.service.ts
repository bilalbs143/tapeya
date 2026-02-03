import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PromotionsService {
  private http = inject(HttpClient);

  public get(params: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/promotions`, { params });
  }

  public types(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/promotions/types`);
  }

  public create(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/promotions`, data);
  }

  public update(id: number, data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/promotions/${id}?_method=PATCH`, data);
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/promotions/${id}`);
  }

  public progress(params: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/promotion-progress`, { params });
  }
}
