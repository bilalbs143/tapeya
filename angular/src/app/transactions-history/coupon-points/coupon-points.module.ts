import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { CouponPointsRoutingModule } from './coupon-points-routing.module';
import { CouponPointsComponent } from './coupon-points.component';

@NgModule({
  imports: [CommonModule, SharedModule, CouponPointsRoutingModule, ReactiveFormsModule, TranslateModule],
  exports: [],
  declarations: [CouponPointsComponent],
  providers: [],
})
export class CouponPointsModule {}
