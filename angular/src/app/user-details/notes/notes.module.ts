import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEditorModule } from 'ngx-editor';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedPipeModule } from '../../shared/pipes/shared-pipe.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageNotesDialogComponent } from './manage-notes-dialog/manage-notes-dialog.component';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesComponent } from './notes.component';

@NgModule({
  declarations: [NotesComponent, ManageNotesDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    NotesRoutingModule,
    NgxEditorModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipeModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class NotesModule {}
