import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MembersPromotionsComponent } from './members-promotions/members-promotions.component';
import { PromotionsManagementComponent } from './promotions/promotions-management.component';

const routes: Routes = [
  {
    path: 'promotions',
    component: PromotionsManagementComponent,
    data: {
      title: 'PROMOTION_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'PROMOTIONS' }, { title: 'PROMOTION_MANAGEMENT' }],
    },
  },
  {
    path: 'members-promotions',
    component: MembersPromotionsComponent,
    data: {
      title: 'MEMBERS_PROMOTIONS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'PROMOTIONS' }, { title: 'MEMBERS_PROMOTIONS' }],
    },
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'promotions',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromotionsRoutingModule {}
