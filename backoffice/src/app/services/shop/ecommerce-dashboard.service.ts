import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { EcommerceDashboardResponse } from 'src/app/models/ecommerce-dashboard.models';

@Injectable({ providedIn: 'root' })
export class EcommerceDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'v1/admin/shop';

  public getStats(): Observable<EcommerceDashboardResponse> {
    return this.http.get<EcommerceDashboardResponse>(`${this.baseUrl}/dashboard-stats`);
  }
}
