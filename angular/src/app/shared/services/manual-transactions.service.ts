import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ManualTransactionsService {
  private http = inject(HttpClient);

  public pay(data: any, id: number): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/transactions/${id}/pay`, data);
  }
}
