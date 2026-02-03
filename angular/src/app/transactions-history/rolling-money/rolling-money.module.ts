import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { RollingMoneyRoutingModule } from './rolling-money-routing.module';
import { RollingMoneyComponent } from './rolling-money.component';

@NgModule({
  imports: [CommonModule, SharedModule, RollingMoneyRoutingModule, TranslateModule, ReactiveFormsModule],
  exports: [],
  declarations: [RollingMoneyComponent],
  providers: [],
})
export class RollingMoneyModule {}
