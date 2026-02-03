import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SoundSettingsComponent } from './sound-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SoundSettingsComponent,
    data: {
      title: 'SOUND_SETTINGS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'SOUND_SETTINGS' }],
      permission: 'sound-setting.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoundSettingsRoutingModule {}
