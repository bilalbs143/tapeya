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
  roles?: UserRole[];
  role_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

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
  role_ids?: number[];
  playing_role?: string | null;
  bowling_style?: string | null;
  batting_style?: string | null;
  country?: string | null;
  city?: string | null;
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
}
