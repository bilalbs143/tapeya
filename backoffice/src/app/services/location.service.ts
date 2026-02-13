import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<{ data: Country[] }>(`${this.baseUrl}/countries`, { params });
  }

  public getCities(countryCode: string, search?: string): Observable<{ data: City[] }> {
    let params = new HttpParams().set('country_code', countryCode);
    if (search) params = params.set('search', search);
    return this.http.get<{ data: City[] }>(`${this.baseUrl}/countries/cities`, { params });
  }
}
