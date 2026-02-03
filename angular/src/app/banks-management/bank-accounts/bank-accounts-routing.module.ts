import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BankAccountsComponent } from './bank-accounts.component';

const routes: Routes = [
  {
    path: '',
    component: BankAccountsComponent,
    data: {
      title: 'BANK_ACCOUNTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'BANK_MANAGEMENT' }, { title: 'BANK_ACCOUNTS' }],
      permission: 'bank_accounts.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankAccountsRoutingModule {}
