import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { HoldingMoneyHistoryRoutingModule } from './holding-money-history-routing.module';
import { HoldingMoneyHistoryComponent } from './holding-money-history.component';

@NgModule({
  declarations: [HoldingMoneyHistoryComponent],
  imports: [CommonModule, SharedModule, HoldingMoneyHistoryRoutingModule, TranslateModule, ReactiveFormsModule],
})
export class HoldingMoneyHistoryModule {}
