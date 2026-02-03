import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { CouponPointsExchangeRoutingModule } from './coupon-points-exchange-routing.module';
import { CouponPointsExchangeComponent } from './coupon-points-exchange.component';

@NgModule({
  imports: [CommonModule, SharedModule, CouponPointsExchangeRoutingModule, ReactiveFormsModule, TranslateModule],
  exports: [],
  declarations: [CouponPointsExchangeComponent],
  providers: [],
})
export class CouponPointsExchangeModule {}
