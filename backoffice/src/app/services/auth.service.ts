import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import type { AuthUser, LoginSuccessResponse } from '../models/auth.models';

const TOKEN_STORAGE_KEY = 'tapeya_backoffice_token';
const USER_STORAGE_KEY = 'tapeya_backoffice_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenSignal = signal<string | null>(this.readTokenFromStorage());
  private readonly userSignal = signal<AuthUser | null>(this.readUserFromStorage());

  public readonly isAuthenticated: Signal<boolean> = computed(() => !!this.tokenSignal());
  public readonly currentUser: Signal<AuthUser | null> = computed(() => this.userSignal());

  public login(credentials: { email: string; password: string }) {
    return this.http.post<LoginSuccessResponse>('v1/admin/login', credentials).pipe((source) => {
      return new Observable<LoginSuccessResponse>((subscriber: any) => {
        const subscription = source.subscribe({
          next: (response) => {
            const token = response.data?.auth?.access_token;
            const user = response.data?.user;

            if (token && user) {
              this.setSession(token, user);
            }

            subscriber.next(response);
            subscriber.complete();
          },
          error: (error) => subscriber.error(error),
        });

        return () => subscription.unsubscribe();
      });
    });
  }

  public logout() {
    this.http.post('v1/admin/logout', {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  public getAccessToken(): string | null {
    return this.tokenSignal();
  }

  private setSession(token: string, user: AuthUser) {
    this.tokenSignal.set(token);
    this.userSignal.set(user);

    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private clearSession() {
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  private readTokenFromStorage(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private readUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
