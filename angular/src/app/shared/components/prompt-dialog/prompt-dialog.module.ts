import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../dialog-wrapper/dialog-wrapper.module';
import { SubmitButtonComponent } from '../submit-button/submit-button.component';

import { PromptDialogComponent } from './prompt-dialog.component';

@NgModule({
  declarations: [PromptDialogComponent],
  exports: [PromptDialogComponent],
  imports: [
    CommonModule,
    DialogWrapperModule,
    MatButtonModule,
    MatDialogModule,
    TranslateModule,
    MatDividerModule,
    MatFormFieldModule,
    SubmitButtonComponent,
  ],
})
export class PromptDialogModule {}
