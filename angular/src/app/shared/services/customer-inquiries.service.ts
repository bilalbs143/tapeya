import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerInquiriesService {
  private http = inject(HttpClient);

  public reply(data: any, id: number): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/customer-inquiries/${id}/reply`, data);
  }

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/customer-inquiries`, {
      params: data,
    });
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/customer-inquiries/${id}`, {});
  }
}
