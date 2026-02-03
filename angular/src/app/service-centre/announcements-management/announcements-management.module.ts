import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { AnnouncementsManagementRoutingModule } from './announcements-management-routing.module';
import { AnnouncementsManagementComponent } from './announcements-management.component';
import { ManageAnnouncementsDialogComponent } from './manage-announcements-dialog/manage-announcements-dialog.component';
import { ManageImportantAnnouncementDialogComponent } from './manage-important-announcement-dialog/manage-important-announcement-dialog.component';

@NgModule({
  declarations: [AnnouncementsManagementComponent, ManageAnnouncementsDialogComponent, ManageImportantAnnouncementDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    AnnouncementsManagementRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
  ],
})
export class AnnouncementsManagementModule {}
