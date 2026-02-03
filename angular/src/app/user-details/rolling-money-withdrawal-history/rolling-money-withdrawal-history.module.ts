import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { RollingMoneyWithdrawalHistoryRoutingModule } from './rolling-money-withdrawal-history-routing.module';
import { RollingMoneyWithdrawalHistoryComponent } from './rolling-money-withdrawal-history.component';

@NgModule({
  declarations: [RollingMoneyWithdrawalHistoryComponent],
  imports: [CommonModule, SharedModule, RollingMoneyWithdrawalHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class RollingMoneyWithdrawalHistoryModule {}
