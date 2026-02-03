import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MembershipBonusesService {
  private http = inject(HttpClient);

  public get(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/membership-level-commission-settings`);
  }

  public update(data: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/membership-level-commission-settings`, data);
  }
}
