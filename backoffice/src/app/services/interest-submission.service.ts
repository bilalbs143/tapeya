import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import type { InterestCampaign } from './interest-campaign.service';
import { MessageService } from './message.service';
import type { UserSearchRow } from './users.service';

export type InterestSubmissionStatus = 'pending' | 'confirmed' | 'withdrawn';

export interface InterestSubmission {
  id: number;
  campaign_id: number;
  user_id: number;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  date_of_birth: string | null;
  profile_picture_url: string | null;
  id_document_url: string | null;
  status: InterestSubmissionStatus;
  status_label: string;
  withdrawn_at: string | null;
  user?: UserSearchRow | null;
  campaign?: InterestCampaign | null;
  created_at?: string;
  updated_at?: string;
}

export interface InterestSubmissionListResponse {
  data: InterestSubmission[];
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

export interface UpdateInterestSubmissionPayload {
  status?: InterestSubmissionStatus;
}

@Injectable({ providedIn: 'root' })
export class InterestSubmissionService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/interest-submissions';

  public getList(
    params: Partial<ListParams> & Record<string, unknown> = {}
  ): Observable<InterestSubmissionListResponse> {
    return this.http.get<InterestSubmissionListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: InterestSubmission }> {
    return this.http.get<{ data: InterestSubmission }>(`${this.baseUrl}/${id}`);
  }

  public update(id: number, payload: UpdateInterestSubmissionPayload): Observable<{ data: InterestSubmission }> {
    return this.http
      .patch<{ data: InterestSubmission }>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.messageService.success('Interest Submission Updated.')));
  }
}
