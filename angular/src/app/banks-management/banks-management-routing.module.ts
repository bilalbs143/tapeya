import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'banks',
    loadChildren: () => import('./banks/banks.module').then((m) => m.BanksModule),
  },
  {
    path: 'bank-accounts',
    loadChildren: () => import('./bank-accounts/bank-accounts.module').then((m) => m.BankAccountsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BanksManagementRoutingModule {}
