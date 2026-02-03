import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageSoundSettingsDialogComponent } from './manage-sound-settings-dialog/manage-sound-settings-dialog.component';
import { SoundSettingsRoutingModule } from './sound-settings-routing.module';
import { SoundSettingsComponent } from './sound-settings.component';

@NgModule({
  declarations: [SoundSettingsComponent, ManageSoundSettingsDialogComponent],
  imports: [CommonModule, SharedModule, SoundSettingsRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
})
export class SoundSettingsModule {}
