import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BanksService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/banks`, { params: data });
  }

  public create(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/banks`, data);
  }

  public update(data: any, id: string): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/banks/${id}`, data);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/banks/${id}`);
  }
}
