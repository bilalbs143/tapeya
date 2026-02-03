import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageAccountInfoDialogComponent } from './manage-account-info-dialog/manage-account-info-dialog.component';
import { QuickAccountInquiriesRoutingModule } from './quick-account-inquiries-routing.module';
import { QuickAccountInquiriesComponent } from './quick-account-inquiries.component';

@NgModule({
  declarations: [QuickAccountInquiriesComponent, ManageAccountInfoDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    QuickAccountInquiriesRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class QuickAccountInquiriesModule {}
