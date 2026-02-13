import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

export interface EnumOption {
  value: string;
  label: string;
}

export type EnumsMap = Record<string, EnumOption[]>;

@Injectable({ providedIn: 'root' })
export class EnumsService {
  private readonly http = inject(HttpClient);
  private readonly url = 'v1/admin/enums';

  private cached: EnumsMap | null = null;

  /**
   * Fetch all enums once and cache. Returns cached data on subsequent calls.
   */
  public getEnums(): Observable<EnumsMap> {
    if (this.cached !== null) {
      return of(this.cached);
    }
    return this.http.get<{ data: EnumsMap }>(this.url).pipe(
      map((res) => res.data ?? {}),
      tap((data) => (this.cached = data))
    );
  }

  /**
   * Get options for a category (e.g. 'user_type', 'user_status'). Uses cached enums when available.
   */
  public getOptions(category: string): Observable<EnumOption[]> {
    return this.getEnums().pipe(map((data) => data[category] ?? []));
  }

  /**
   * Clear cache (e.g. after logout) so next request refetches.
   */
  public clearCache(): void {
    this.cached = null;
  }
}
