import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlDisplayComponent } from '../../shared/components/url-display/url-display.component';
import { SharedModule } from '../../shared/shared.module';

import { LoginHistoryRoutingModule } from './login-history-routing.module';
import { LoginHistoryComponent } from './login-history.component';

@NgModule({
  declarations: [LoginHistoryComponent],
  imports: [CommonModule, SharedModule, LoginHistoryRoutingModule, ReactiveFormsModule, TranslateModule, UrlDisplayComponent],
})
export class LoginHistoryModule {}
