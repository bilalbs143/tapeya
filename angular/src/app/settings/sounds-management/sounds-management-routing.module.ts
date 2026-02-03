import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SoundsManagementComponent } from './sounds-management.component';

const routes: Routes = [
  {
    path: '',
    component: SoundsManagementComponent,
    data: {
      title: 'SOUNDS_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'SOUNDS_MANAGEMENT' }],
      permission: 'sound.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoundsManagementRoutingModule {}
