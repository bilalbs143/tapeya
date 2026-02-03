import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { LosingMoneyWithdrawalHistoryRoutingModule } from './losing-money-withdrawal-history-routing.module';
import { LosingMoneyWithdrawalHistoryComponent } from './losing-money-withdrawal-history.component';

@NgModule({
  declarations: [LosingMoneyWithdrawalHistoryComponent],
  imports: [CommonModule, SharedModule, LosingMoneyWithdrawalHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class LosingMoneyWithdrawalHistoryModule {}
