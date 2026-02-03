import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { MaterialModule } from '../material.module';
import { DateFormatComponent } from '../shared/components/date-format/date-format.component';
import { HiddenItemComponent } from '../shared/components/hidden-item/hidden-item.component';
import { AppPaginatorModule } from '../shared/components/paginator/app-paginator.module';
import { SerialNumberComponent } from '../shared/components/serial-number/serial-number.component';
import { SharedDialogModule } from '../shared/components/shared-dialog.module';
import { SubmitButtonComponent } from '../shared/components/submit-button/submit-button.component';
import { TableWrapperComponent } from '../shared/components/table-wrapper/table-wrapper.component';

import { MembersPromotionsComponent } from './members-promotions/members-promotions.component';
import { ManagePromotionDialogComponent } from './promotions/manage-promotion-dialog/manage-promotion-dialog.component';
import { PromotionsManagementComponent } from './promotions/promotions-management.component';
import { PromotionsRoutingModule } from './promotions-routing.module';

@NgModule({
  declarations: [PromotionsManagementComponent, ManagePromotionDialogComponent, MembersPromotionsComponent],
  imports: [
    CommonModule,
    PromotionsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    NgxEditorModule,
    MaterialModule,
    TranslatePipe,
    SubmitButtonComponent,
    SharedDialogModule,
    TableWrapperComponent,
    SerialNumberComponent,
    DateFormatComponent,
    TablerIconComponent,
    HiddenItemComponent,
    AppPaginatorModule,
  ],
})
export class PromotionsModule {}
