import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);

  public isRequestProcessed$ = new Subject<void>();

  public notifyRequestProcessed(): void {
    this.isRequestProcessed$.next();
  }

  public requests(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/stats/requests`, {});
  }

  public calculations(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/stats/calculations`, {});
  }

  public userCalculations(id: number): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/stats/user-calculations/${id}`, {});
  }

  public activities(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/stats/activities`, {});
  }

  public requestsCounter(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/stats/requests/counter`, {});
  }
}
