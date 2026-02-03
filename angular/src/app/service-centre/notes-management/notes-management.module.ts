import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageNotesDialogComponent } from './manage-notes-dialog/manage-notes-dialog.component';
import { NotesManagementRoutingModule } from './notes-management-routing.module';
import { NotesManagementComponent } from './notes-management.component';

@NgModule({
  declarations: [NotesManagementComponent, ManageNotesDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    NotesManagementRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class NotesManagementModule {}
