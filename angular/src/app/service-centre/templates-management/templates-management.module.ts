import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageTemplatesDialogComponent } from './manage-templates-dialog/manage-templates-dialog.component';
import { TemplatesManagementRoutingModule } from './templates-management-routing.module';
import { TemplatesManagementComponent } from './templates-management.component';

@NgModule({
  declarations: [TemplatesManagementComponent, ManageTemplatesDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    TemplatesManagementRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class TemplatesManagementModule {}
