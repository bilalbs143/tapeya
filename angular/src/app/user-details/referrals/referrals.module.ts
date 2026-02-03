import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlDisplayComponent } from '../../shared/components/url-display/url-display.component';
import { SharedModule } from '../../shared/shared.module';

import { ReferralsRoutingModule } from './referrals-routing.module';
import { ReferralsComponent } from './referrals.component';

@NgModule({
  declarations: [ReferralsComponent],
  imports: [CommonModule, SharedModule, ReferralsRoutingModule, ReactiveFormsModule, TranslateModule, UrlDisplayComponent],
})
export class ReferralsModule {}
