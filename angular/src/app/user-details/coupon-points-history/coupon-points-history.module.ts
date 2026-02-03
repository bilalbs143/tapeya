import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { CouponPointsHistoryRoutingModule } from './coupon-points-history-routing.module';
import { CouponPointsHistoryComponent } from './coupon-points-history.component';

@NgModule({
  declarations: [CouponPointsHistoryComponent],
  imports: [CommonModule, SharedModule, CouponPointsHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class CouponPointsHistoryModule {}
