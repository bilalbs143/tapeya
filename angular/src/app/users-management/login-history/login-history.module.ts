import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlDisplayComponent } from '../../shared/components/url-display/url-display.component';
import { SharedModule } from '../../shared/shared.module';

import { LoginHistoryRoutingModule } from './login-history-routing.module';
import { LoginHistoryComponent } from './login-history.component';

@NgModule({
  imports: [CommonModule, SharedModule, LoginHistoryRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, UrlDisplayComponent],
  exports: [],
  declarations: [LoginHistoryComponent],
  providers: [],
})
export class LoginHistoryModule {}
