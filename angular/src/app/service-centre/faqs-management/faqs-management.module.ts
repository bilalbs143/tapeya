import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { FaqsManagementRoutingModule } from './faqs-management-routing.module';
import { FaqsManagementComponent } from './faqs-management.component';
import { ManageFaqsDialogComponent } from './manage-faqs-dialog/manage-faqs-dialog.component';

@NgModule({
  declarations: [FaqsManagementComponent, ManageFaqsDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    FaqsManagementRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class FaqsManagementModule {}
