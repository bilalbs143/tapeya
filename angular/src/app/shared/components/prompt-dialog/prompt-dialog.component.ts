import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  standalone: false,
})
export class PromptDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<PromptDialogComponent>>(MatDialogRef);

  public isSubmitting: boolean = false;

  public disableButton(): void {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.dialogRef.close(true);
    }, 1500);
  }
}
