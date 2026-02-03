import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { apiUrl } from '../functions/core.function';
import { AudioNotificationService } from '../services/audio-notification.service';
import { LocalStorageService } from '../services/local-storage.service';
import { MessageService } from '../services/message.service';
import { PusherService } from '../services/pusher.service';
import { TranslationLoaderService } from '../services/translation-loader.service';

function auth(path: string): string {
  return apiUrl(`auth/${path}`);
}

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

interface UserData {
  id: number;
  type: string;
  type_enum: string;
  name: string;
  username: string;
  locale: string;
  dob: string;
  phone: string;
  level: number;
  status: string;
  created_at_ip: string;
  bank_account: BankAccount;
  permissions: Array<any>;
}

interface AuthData {
  access_token: string;
  token_type: string;
  expires_at: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: UserData;
    auth: AuthData;
  };
}

@Injectable({
  providedIn: 'any',
})
export class AuthService {
  router = inject(Router);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  private localStorageService = inject(LocalStorageService);
  private audioService = inject(AudioNotificationService);
  private pusherService = inject(PusherService);
  private translate = inject(TranslateService);
  private translationLoaderService = inject(TranslationLoaderService);

  constructor() {
    // Set initial authentication status
    const isAuthenticated = this.isAuthenticated();
    this.audioService.setAuthenticationStatus(isAuthenticated);

    if (isAuthenticated) {
      const user = this.getLoggedInUser();
      this.pusherService.setAuthenticationData(true, this.getToken(), user?.id || null);
    } else {
      this.pusherService.setAuthenticationData(false, null, null);
    }
  }

  public login(
    username: string | null | undefined,
    password: string | null | undefined,
    rememberMe: string | null | undefined | boolean = false
  ): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${environment.API_URL}auth/login`, {
        username,
        password,
        rememberMe,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        catchError((error) => {
          this.messageService.snackBar(error.error.message);
          return throwError(error);
        })
      );
  }

  public logout(manual: boolean = false): void {
    // Clean up audio notifications before logout
    this.audioService.cleanup();

    // Clean up Pusher connections before logout
    this.pusherService.cleanup();

    if (manual) {
      this.httpClient
        .post<any>(auth('logout'), {})
        .pipe(
          catchError((error) => {
            console.error('Error:', error.error.message);
            return throwError(error);
          })
        )
        .subscribe({
          next: (response) => {
            this.messageService.snackBar(response.message);
          },
          error: (error) => {
            console.error('Error:', error);
            this.messageService.snackBar(error.error.message);
          },
        });
    }
    this.clearSession();
    this.router.navigate(['/authentication/login']);
  }

  public updatePassword(data: any): Observable<any> {
    return this.httpClient.patch(auth('profile/password'), data);
  }

  public updateProfile(data: any): Observable<any> {
    return this.httpClient.patch(auth('profile'), data);
  }

  public me(): Observable<any> {
    return this.httpClient.get(auth('profile/me'), {});
  }

  public ensureAccessToken(): void {
    this.httpClient.post<boolean>(auth('ensure-access-token'), {}).subscribe();
  }

  public isAuthenticated(): boolean {
    const authenticated = (moment().isBefore(this.getExpiration()) || !this.getExpiration()) && !!this.getToken();
    // Update audio service authentication status
    this.audioService.setAuthenticationStatus(authenticated);
    return authenticated;
  }

  public getToken(): string {
    return this.localStorageService.get('access_token');
  }

  public clearSession(): void {
    this.localStorageService.clear();
    // Update audio service authentication status
    this.audioService.setAuthenticationStatus(false);
    // Update Pusher service authentication data
    this.pusherService.setAuthenticationData(false, null, null);
  }

  public setSession(loginResponse: LoginResponse): void {
    this.clearSession();
    this.setPermissions(loginResponse.data.user.permissions);
    this.setLoggedInUser(loginResponse.data.user);

    // Set access token FIRST (needed for authenticated API calls)
    this.localStorageService.set('access_token', loginResponse.data.auth.access_token);
    this.localStorageService.set('expires_at', moment(loginResponse.data.auth.expires_at));

    // Use local language from centralized service, NOT the user's server preference
    const localLanguage = this.translationLoaderService.getLanguage();
    const userServerLocale = loginResponse.data.user.locale || 'en';

    // Keep using the local language
    this.translationLoaderService.setLanguage(localLanguage);
    this.translate.use(localLanguage);

    // If local language differs from server, update the server (token is now set)
    if (localLanguage !== userServerLocale) {
      this.translationLoaderService.setLanguage(localLanguage, true);
    }

    this.messageService.snackBar(loginResponse.message);
    // Update audio service authentication status
    this.audioService.setAuthenticationStatus(true);
    // Update Pusher service authentication data
    this.pusherService.setAuthenticationData(true, loginResponse.data.auth.access_token, loginResponse.data.user.id);
  }

  public setLoggedInUser(user: UserData): void {
    this.localStorageService.set('user', {
      id: user.id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      type: user.type,
      typeEnum: user.type_enum,
      status: user.status,
    });
  }

  public getExpiration(): moment.Moment | null {
    const expiration = this.localStorageService.get('expires_at');
    if (expiration) {
      return moment(expiration);
    } else {
      return null;
    }
  }

  public getLoggedInUser(): any {
    return this.localStorageService.get('user');
  }

  public setPermissions(permissions: Array<string>): void {
    this.localStorageService.set('permissions', permissions);
  }

  public getPermissions(): any {
    return this.localStorageService.get('permissions') || [];
  }
}
