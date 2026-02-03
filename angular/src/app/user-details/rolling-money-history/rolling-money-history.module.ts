import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { RollingMoneyHistoryRoutingModule } from './rolling-money-history-routing.module';
import { RollingMoneyHistoryComponent } from './rolling-money-history.component';

@NgModule({
  declarations: [RollingMoneyHistoryComponent],
  imports: [CommonModule, SharedModule, RollingMoneyHistoryRoutingModule, TranslateModule, ReactiveFormsModule],
})
export class RollingMoneyHistoryModule {}
