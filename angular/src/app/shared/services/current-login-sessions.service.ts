import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CurrentLoginSessionsService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/authentication/login/current`, { params: data });
  }

  public kill(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/authentication/login/current/${id}/kill`);
  }
}
