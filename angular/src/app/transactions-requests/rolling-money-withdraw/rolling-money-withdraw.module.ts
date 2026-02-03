import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { RollingMoneyWithdrawActionDialogComponent } from './action-dialog/action-dialog.component';
import { RollingMoneyWithdrawDialogComponent } from './rolling-money-withdraw-dialog/rolling-money-withdraw-dialog.component';
import { RollingMoneyWithdrawRoutingModule } from './rolling-money-withdraw-routing.module';
import { RollingMoneyWithdrawComponent } from './rolling-money-withdraw.component';

@NgModule({
  declarations: [RollingMoneyWithdrawComponent, RollingMoneyWithdrawDialogComponent, RollingMoneyWithdrawActionDialogComponent],
  imports: [CommonModule, SharedModule, RollingMoneyWithdrawRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
})
export class RollingMoneyWithdrawModule {}
