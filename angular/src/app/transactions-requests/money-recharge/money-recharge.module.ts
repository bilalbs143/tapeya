import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedDialogModule } from '../../shared/components/shared-dialog.module';
import { SharedModule } from '../../shared/shared.module';

import { MoneyRechargeActionDialogComponent } from './action-dialog/action-dialog.component';
import { MoneyRechargeRoutingModule } from './money-recharge-routing.module';
import { MoneyRechargeComponent } from './money-recharge.component';

@NgModule({
  declarations: [MoneyRechargeComponent, MoneyRechargeActionDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    MoneyRechargeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogWrapperModule,
    SharedDialogModule,
    NgOptimizedImage,
  ],
})
export class MoneyRechargeModule {}
