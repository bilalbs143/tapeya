import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { ManagePopupsDialogComponent } from './manage-popups-dialog/manage-popups-dialog.component';
import { PopupsManagementRoutingModule } from './popups-management-routing.module';
import { PopupsManagementComponent } from './popups-management.component';

@NgModule({
  declarations: [PopupsManagementComponent, ManagePopupsDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    PopupsManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class PopupsManagementModule {}
