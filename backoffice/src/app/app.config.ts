import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { routes } from './app.routes';
import { apiPrefixInterceptor } from './interceptors/api-prefix.interceptor';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { MaterialModule } from './material.module';

/** Datepicker display/parse format: YYYY-MM-DD (e.g. 2026-09-10). */
const APP_DATE_FORMATS = {
  parse: { dateInput: null },
  display: {
    dateInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'sv-SE' },
    provideNativeDateAdapter(APP_DATE_FORMATS),
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([apiPrefixInterceptor, authTokenInterceptor, errorInterceptor])),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(FormsModule, ReactiveFormsModule, MaterialModule, TablerIconsModule.pick(TablerIcons), NgScrollbarModule),
  ],
};
