import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotesManagementService {
  private http = inject(HttpClient);

  public create(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/notes`, data);
  }

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/notes`, { params: data });
  }

  public users(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/note/users`, { params: data });
  }

  public categories(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/notes/categories`, {});
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}admin/notes/${id}`, {});
  }
}
