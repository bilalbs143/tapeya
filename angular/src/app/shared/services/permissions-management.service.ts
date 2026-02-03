import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PermissionsManagementService {
  private http = inject(HttpClient);

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/permissions/view-property-permissions`, {
      params: data,
    });
  }

  public sync(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/roles/${id}/sync`, data);
  }
}
