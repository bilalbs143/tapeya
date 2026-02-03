import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlDisplayComponent } from '../../shared/components/url-display/url-display.component';
import { SharedModule } from '../../shared/shared.module';

import { CurrentLoginSessionsRoutingModule } from './current-login-sessions-routing.module';
import { CurrentLoginSessionsComponent } from './current-login-sessions.component';

@NgModule({
  imports: [CommonModule, SharedModule, CurrentLoginSessionsRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, UrlDisplayComponent],
  exports: [],
  declarations: [CurrentLoginSessionsComponent],
  providers: [],
})
export class CurrentLoginSessionsModule {}
