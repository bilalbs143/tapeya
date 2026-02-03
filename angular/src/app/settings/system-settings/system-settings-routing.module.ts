import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SystemSettingsComponent } from './system-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SystemSettingsComponent,
    data: {
      title: 'SYSTEM_SETTINGS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'SYSTEM_SETTINGS' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemSettingsRoutingModule {}
