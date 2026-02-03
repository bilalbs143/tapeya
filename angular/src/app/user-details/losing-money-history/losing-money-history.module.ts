import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { LosingMoneyHistoryRoutingModule } from './losing-money-history-routing.module';
import { LosingMoneyHistoryComponent } from './losing-money-history.component';

@NgModule({
  declarations: [LosingMoneyHistoryComponent],
  imports: [CommonModule, SharedModule, LosingMoneyHistoryRoutingModule, TranslateModule, ReactiveFormsModule],
})
export class LosingMoneyHistoryModule {}
