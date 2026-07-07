import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';
import type { UserSearchRow } from './users.service';
import type { InterestFormFieldKey } from 'src/app/shared/constants/interest-form-field.constants';

export type InterestCampaignStatus = 'open' | 'closed';

export interface InterestCampaignTournament {
  id: number;
  tournament_name: string;
  start_date: string | null;
  status: string | null;
  status_label: string | null;
}

export interface InterestCampaign {
  id: number;
  tournament_id: number | null;
  is_linked: boolean;
  tournament_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  show_in_sidebar: boolean;
  show_dialog: boolean;
  form_fields?: InterestFormFieldKey[];
  status: InterestCampaignStatus;
  status_label: string;
  created_by: number | null;
  creator?: UserSearchRow | null;
  tournament?: InterestCampaignTournament | null;
  submissions_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InterestCampaignListResponse {
  data: InterestCampaign[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: Record<string, string | null>;
}

export interface CreateInterestCampaignPayload {
  tournament_id?: number | null;
  tournament_name?: string | null;
  slug?: string | null;
  description?: string | null;
  show_in_sidebar?: boolean;
  show_dialog?: boolean;
  form_fields?: InterestFormFieldKey[];
  status?: InterestCampaignStatus | null;
}

export type UpdateInterestCampaignPayload = Partial<CreateInterestCampaignPayload>;

@Injectable({ providedIn: 'root' })
export class InterestCampaignService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/interest-campaigns';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<InterestCampaignListResponse> {
    return this.http.get<InterestCampaignListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: InterestCampaign }> {
    return this.http.get<{ data: InterestCampaign }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: CreateInterestCampaignPayload | FormData): Observable<{ data: InterestCampaign }> {
    return this.http
      .post<{ data: InterestCampaign }>(this.baseUrl, payload)
      .pipe(tap(() => this.messageService.success('Interest Campaign Created.')));
  }

  public update(id: number, payload: UpdateInterestCampaignPayload): Observable<{ data: InterestCampaign }> {
    return this.http
      .patch<{ data: InterestCampaign }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Interest Campaign Updated.')));
  }

  public delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.messageService.success('Interest Campaign Deleted.')));
  }
}
