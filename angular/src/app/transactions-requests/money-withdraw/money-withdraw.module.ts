import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { MoneyWithdrawActionDialogComponent } from './action-dialog/action-dialog.component';
import { MoneyWithdrawRoutingModule } from './money-withdraw-routing.module';
import { MoneyWithdrawComponent } from './money-withdraw.component';

@NgModule({
  declarations: [MoneyWithdrawComponent, MoneyWithdrawActionDialogComponent],
  imports: [CommonModule, SharedModule, MoneyWithdrawRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
})
export class MoneyWithdrawModule {}
