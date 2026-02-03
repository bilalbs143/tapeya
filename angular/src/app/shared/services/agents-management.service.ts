import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

interface CreateAgentData {
  username: string;
  name: string;
  password: string;
  password_confirmation: string;
  phone: string;
  dob: string;
  bank_id: string;
  account_number: string;
  account_holder: string;
  losing_point_ratio: number;
  parent_id: number;
  ref_code: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentsManagementService {
  private http = inject(HttpClient);

  public create(data: CreateAgentData): Observable<any> {
    return this.http.post(`${environment.API_URL}admin/agents`, data);
  }

  public get(data: any): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/agents`, {
      params: data,
    });
  }

  public update(data: any, id: number): Observable<any> {
    return this.http.patch(`${environment.API_URL}admin/agents/${id}`, data);
  }

  public hierarchy(): Observable<any> {
    return this.http.get(`${environment.API_URL}admin/agents/hierarchy`, {});
  }
}
