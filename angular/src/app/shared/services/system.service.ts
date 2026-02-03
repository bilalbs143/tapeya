import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private http = inject(HttpClient);

  public get(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/system/info`, {});
  }
}
