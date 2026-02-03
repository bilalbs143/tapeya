import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsManagementService {
  private http = inject(HttpClient);

  public create(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/announcements`, data);
  }

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/announcements`, {
      params: data,
    });
  }

  public categories(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/announcements/categories`, {});
  }

  public update(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/announcements/${id}`, data);
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/announcements/${id}`);
  }

  public getImportantAnnouncement(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/announcements/important`);
  }
}
