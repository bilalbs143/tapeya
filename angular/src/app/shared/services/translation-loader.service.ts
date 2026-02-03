import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Subject } from 'rxjs';

import { apiUrl } from '../functions/core.function';

import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TranslationLoaderService {
  private localStorageService = inject(LocalStorageService);
  private httpClient = inject(HttpClient);

  private languageSubject = new Subject<string>();

  public setLanguage(language: string, setServerSide: boolean = false): void {
    if (setServerSide) {
      // Make API call directly to avoid circular dependency with AuthService
      this.httpClient
        .patch(apiUrl('auth/profile'), {
          locale: language,
        })
        .subscribe({
          error: (error) => {
            console.error('Failed to update language preference:', error);
          },
        });
    }

    this.localStorageService.set('userLanguage', language);
    this.languageSubject.next(language);
  }

  public getLanguage(): string {
    return this.localStorageService.get('userLanguage') || 'en';
  }
}

export function initializeTranslation(translate: TranslateService, translationLoaderService: TranslationLoaderService) {
  return (): void => {
    translate.setDefaultLang('en');
    const userLanguage = translationLoaderService.getLanguage();
    translate.use(userLanguage);
    translationLoaderService.setLanguage(userLanguage);
  };
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
