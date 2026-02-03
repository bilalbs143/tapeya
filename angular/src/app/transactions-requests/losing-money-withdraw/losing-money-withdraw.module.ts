import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../material.module';
import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { LosingMoneyWithdrawActionDialogComponent } from './action-dialog/action-dialog.component';
import { LosingMoneyWithdrawDialogComponent } from './losing-money-withdraw-dialog/losing-money-withdraw-dialog.component';
import { LosingMoneyWithdrawComponent } from './losing-money-withdraw.component';
import { LosingPointsWithdrawRoutingModule } from './losing-points-withdraw-routing.module';

@NgModule({
  declarations: [LosingMoneyWithdrawComponent, LosingMoneyWithdrawDialogComponent, LosingMoneyWithdrawActionDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    LosingPointsWithdrawRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class LosingMoneyWithdrawModule {}
