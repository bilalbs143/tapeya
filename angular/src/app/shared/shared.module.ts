import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { IconsModule } from '../icons/icons.module';
import { MaterialModule } from '../material.module';

import { AmountDisplayComponent } from './components/amount-display/amount-display.component';
import { DateFormatComponent } from './components/date-format/date-format.component';
import { HiddenItemComponent } from './components/hidden-item/hidden-item.component';
import { AppPaginatorModule } from './components/paginator/app-paginator.module';
import { SerialNumberComponent } from './components/serial-number/serial-number.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TableWrapperComponent } from './components/table-wrapper/table-wrapper.component';
import { UserDetailsLinkComponent } from './components/user-details-link/user-details-link.component';
import { DirectivesModule } from './directives/directives.module';
import { SharedPipeModule } from './pipes/shared-pipe.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    // Local Common Modules
    AppPaginatorModule,
    SharedPipeModule,
    UserDetailsLinkComponent,
    HiddenItemComponent,
    IconsModule,
    DirectivesModule,
    TableWrapperComponent,
    NgxSkeletonLoaderModule,
    SubmitButtonComponent,
    SerialNumberComponent,
    DateFormatComponent,
    AmountDisplayComponent,
  ],
  declarations: [],
  exports: [
    MaterialModule,
    IconsModule,
    // Local Common Modules
    AppPaginatorModule,
    NgxSkeletonLoaderModule,
    SubmitButtonComponent,
    UserDetailsLinkComponent,
    HiddenItemComponent,
    DirectivesModule,
    TranslateModule,
    TableWrapperComponent,
    SerialNumberComponent,
    DateFormatComponent,
    AmountDisplayComponent,
    SharedPipeModule,
  ],
  providers: [DatePipe, { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }],
})
export class SharedModule {}
