import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageSoundsDialogComponent } from './manage-sounds-dialog/manage-sounds-dialog.component';
import { SoundsManagementRoutingModule } from './sounds-management-routing.module';
import { SoundsManagementComponent } from './sounds-management.component';

@NgModule({
  declarations: [SoundsManagementComponent, ManageSoundsDialogComponent],
  imports: [CommonModule, SharedModule, SoundsManagementRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
})
export class SoundsManagementModule {}
