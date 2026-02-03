import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { BankAccountsRoutingModule } from './bank-accounts-routing.module';
import { BankAccountsComponent } from './bank-accounts.component';
import { ManageBankAccountDialogComponent } from './manage-bank-account-dialog/manage-bank-account-dialog.component';

@NgModule({
  imports: [SharedModule, BankAccountsRoutingModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
  exports: [],
  declarations: [BankAccountsComponent, ManageBankAccountDialogComponent],
  providers: [],
})
export class BankAccountsModule {}
