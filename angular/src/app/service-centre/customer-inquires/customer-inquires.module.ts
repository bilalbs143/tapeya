import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { CustomerInquiresRoutingModule } from './customer-inquires-routing.module';
import { CustomerInquiresComponent } from './customer-inquires.component';
import { ManageCustomerInquiriesDialogComponent } from './manage-customer-inquiries-dialog/manage-customer-inquiries-dialog.component';

@NgModule({
  declarations: [CustomerInquiresComponent, ManageCustomerInquiriesDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    CustomerInquiresRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class CustomerInquiresModule {}
