import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';

export interface Country {
  id: number;
  name: string;
  country_code: string;
}

export interface City {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'v1/admin';

  public getCountries(search?: string): Observable<{ data: Country[] }> {
    return this.http.get<{ data: Country[] }>(`${this.baseUrl}/countries`, {
      params: toHttpParams({}, { search }),
    });
  }

  public getCities(countryCode: string, search?: string): Observable<{ data: City[] }> {
    return this.http.get<{ data: City[] }>(`${this.baseUrl}/countries/cities`, {
      params: toHttpParams({ country_code: countryCode }, { search }),
    });
  }
}
