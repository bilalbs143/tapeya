import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';

export interface UserRole {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  type: string;
  type_enum: string;
  status: string;
  status_enum: string;
  playing_role?: string | null;
  playing_role_enum?: string | null;
  bowling_style?: string | null;
  bowling_style_enum?: string | null;
  batting_style?: string | null;
  batting_style_enum?: string | null;
  country?: string | null;
  city?: string | null;
  active_platform?: string | null;
  active_platform_label?: string | null;
  active_platform_updated_at?: string | null;
  can_broadcast?: boolean;
  is_official?: boolean;
  admin_roles?: UserRole[];
  admin_role_ids?: number[];
  created_by?: number | null;
  creator?: { id: number; name: string; nickname: string | null } | null;
  referral_nickname?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Minimal user row for admin search pickers (organizer, broadcast staff, team squads, etc.).
 */
export type UserSearchRow = Pick<User, 'id' | 'name' | 'nickname' | 'email'> & {
  phone?: string | null;
};

export interface UsersListResponse {
  data: User[];
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

export interface CreateUserPayload {
  name: string;
  nickname: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  password?: string | null;
  password_confirmation?: string | null;
  type: string;
  status?: string | null;
  admin_role_ids?: number[];
  playing_role?: string | null;
  bowling_style?: string | null;
  batting_style?: string | null;
  country?: string | null;
  city?: string | null;
  can_broadcast?: boolean;
  is_official?: boolean;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/users';

  public getList(params: Partial<ListParams> = {}): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(this.baseUrl, { params: toHttpParams(params as Record<string, unknown>) });
  }

  public getById(id: number): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Unified admin user typeahead — `GET v1/admin/users/search?search=…`
   * Same endpoint for organizer, team owner, squad, broadcast staff, etc.
   */
  public adminUserSearch(search?: string | null): Observable<{ data: UserSearchRow[] }> {
    return this.http.get<{ data: UserSearchRow[] }>(`${this.baseUrl}/search`, {
      params: toHttpParams({}, { search: search ?? '' }),
    });
  }

  public create(payload: CreateUserPayload): Observable<{ data: User }> {
    return this.http.post<{ data: User }>(this.baseUrl, payload).pipe(
      tap(() => {
        this.messageService.success('User created successfully.');
      })
    );
  }

  public update(id: number, payload: UpdateUserPayload): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('User updated successfully.');
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.messageService.success('User deleted successfully.');
      })
    );
  }

  /** Revokes self-serve broadcasting access, ending any active broadcast and deleting its VOD. */
  public banBroadcaster(id: number): Observable<{ data: { can_broadcast: boolean; ended_streams: number } }> {
    return this.http
      .post<{ data: { can_broadcast: boolean; ended_streams: number } }>(`${this.baseUrl}/${id}/broadcast-ban`, {})
      .pipe(
        tap(() => {
          this.messageService.success('Broadcast access revoked.');
        })
      );
  }
}
