import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { MoneyRechargeHistoryRoutingModule } from './money-recharge-history-routing.module';
import { MoneyRechargeHistoryComponent } from './money-recharge-history.component';

@NgModule({
  declarations: [MoneyRechargeHistoryComponent],
  imports: [CommonModule, SharedModule, MoneyRechargeHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class MoneyRechargeHistoryModule {}
