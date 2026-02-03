import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { ReferralDownlineRoutingModule } from './referral-downline-routing.module';
import { ReferralDownlineComponent } from './referral-downline.component';

@NgModule({
  declarations: [ReferralDownlineComponent],
  imports: [CommonModule, SharedModule, ReferralDownlineRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule],
})
export class ReferralDownlineModule {}
