import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { WithdrawalHistoryRoutingModule } from './withdrawal-history-routing.module';
import { WithdrawalHistoryComponent } from './withdrawal-history.component';

@NgModule({
  declarations: [WithdrawalHistoryComponent],
  imports: [CommonModule, SharedModule, WithdrawalHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class WithdrawalHistoryModule {}
