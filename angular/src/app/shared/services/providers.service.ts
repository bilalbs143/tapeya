import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProvidersService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/providers`, {
      params: data,
    });
  }

  public update(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/providers/${id}`, data);
  }
}
