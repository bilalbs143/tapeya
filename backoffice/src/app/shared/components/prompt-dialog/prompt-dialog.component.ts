import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface PromptDialogData {
  title: string;
  message: string;
  acceptBtnText?: string;
  rejectBtnText?: string;
  onlyCancel?: boolean;
  rejectBtn?: boolean;
}

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDividerModule, DialogWrapperComponent, SubmitButtonComponent],
  templateUrl: './prompt-dialog.component.html',
})
export class PromptDialogComponent {
  public readonly data: PromptDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<PromptDialogComponent>>(MatDialogRef);

  public isSubmitting = false;

  public accept(): void {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.dialogRef.close(true);
    }, 1500);
  }
}
