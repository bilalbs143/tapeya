import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionsHistoryService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/transactions`, {
      params: data,
    });
  }

  public categories(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/transactions/categories`, {});
  }
}
