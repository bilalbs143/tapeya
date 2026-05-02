import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { CricketDashboardResponse } from 'src/app/models/cricket-dashboard.models';

@Injectable({ providedIn: 'root' })
export class CricketDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'v1/admin/cricket';

  public getStats(): Observable<CricketDashboardResponse> {
    return this.http.get<CricketDashboardResponse>(`${this.baseUrl}/dashboard-stats`);
  }
}
