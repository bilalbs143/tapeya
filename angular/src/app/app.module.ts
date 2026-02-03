import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsModule } from './icons/icons.module';
//Import all material modules
import { BlankComponent } from './layouts/blank/blank.component';
import { ChildComponent } from './layouts/child/child.component';
import { FullComponent } from './layouts/full/full.component';
import { MaterialModule } from './material.module';
//Import Layouts
import { FilterPipe } from './pipe/filter.pipe';
import { AuthGuard } from './shared/auth/auth-guard.service';
import { AuthService } from './shared/auth/auth.service';
import { PermissionGuard } from './shared/auth/permission-guard.service';
import { MiddlewareInterceptor } from './shared/interceptors/middleware.interceptor';
import { HttpLoaderFactory, initializeTranslation, TranslationLoaderService } from './shared/services/translation-loader.service';
import { WINDOW_PROVIDERS } from './shared/services/window.service';

@NgModule({
  declarations: [AppComponent, BlankComponent, FilterPipe],
  exports: [IconsModule],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    IconsModule,
    NgScrollbarModule,
    FullComponent,
    ChildComponent,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    AuthService,
    AuthGuard,
    PermissionGuard,
    WINDOW_PROVIDERS,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MiddlewareInterceptor,
      multi: true,
    },
    [
      TranslationLoaderService,
      {
        provide: APP_INITIALIZER,
        useFactory: initializeTranslation,
        deps: [TranslateService, TranslationLoaderService],
        multi: true,
      },
    ],
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
