import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionRequestsService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/transactions/requests`, {
      params: data,
    });
  }

  public approveTransactionRequest(data: any, id: number): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/transactions/requests/${id}/approve`, data);
  }

  public rejectTransactionRequest(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/transactions/requests/${data.id}/reject`, {});
  }

  public rollingMoneyTransactionRequest(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}user/transactions/requests`, data);
  }
}
