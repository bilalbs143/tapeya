import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { BanksRoutingModule } from './banks-routing.module';
import { BanksComponent } from './banks.component';
import { ManageBankDialogComponent } from './manage-bank-dialog/manage-bank-dialog.component';

@NgModule({
  imports: [SharedModule, BanksRoutingModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
  exports: [],
  declarations: [BanksComponent, ManageBankDialogComponent],
  providers: [],
})
export class BanksModule {}
