import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { SystemSettingsRoutingModule } from './system-settings-routing.module';
import { SystemSettingsComponent } from './system-settings.component';

@NgModule({
  declarations: [SystemSettingsComponent],
  imports: [CommonModule, SharedModule, SystemSettingsRoutingModule, TranslateModule, FormsModule, ReactiveFormsModule],
  exports: [],
})
export class SystemSettingsModule {}
