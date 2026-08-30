import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialModule } from 'src/app/material.module';
import { CommonSharedModule } from 'src/app/shared/common.module';

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
  imports: [MaterialModule, CommonSharedModule],
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
