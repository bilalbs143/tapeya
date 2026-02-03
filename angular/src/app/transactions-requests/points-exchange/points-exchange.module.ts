import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { PointsExchangeRoutingModule } from './points-exchange-routing.module';
import { PointsExchangeComponent } from './points-exchange.component';

@NgModule({
  imports: [CommonModule, SharedModule, PointsExchangeRoutingModule, ReactiveFormsModule, TranslateModule],
  exports: [],
  declarations: [PointsExchangeComponent],
  providers: [],
})
export class PointsExchangeModule {}
