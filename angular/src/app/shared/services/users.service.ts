import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/members`, {
      params: data,
    });
  }

  public show(id: number): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/users/${id}`, {});
  }

  public updatePassword(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/users/${id}`, data);
  }

  public update(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/members/${id}`, data);
  }

  public updateStatus(data: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/members/${data.id}`, data);
  }

  public getReferredUsers(id: number, params: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/members/${id}/referred-users`, {
      params,
    });
  }

  public getUsersWithReferrals(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/members/users-with-referrals`);
  }
}
