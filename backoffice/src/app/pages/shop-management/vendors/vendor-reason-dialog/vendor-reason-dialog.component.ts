import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';

import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface VendorReasonDialogData {
  title: string;
  message: string;
  confirmText: string;
  reasonLabel?: string;
  reasonRequired?: boolean;
}

@Component({
  selector: 'app-vendor-reason-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatInputModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './vendor-reason-dialog.component.html',
})
export class VendorReasonDialogComponent {
  public readonly data = inject<VendorReasonDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VendorReasonDialogComponent, string | null>);
  private readonly fb = inject(FormBuilder);

  public readonly form = this.fb.group({
    reason: ['', this.data.reasonRequired ? [Validators.required, Validators.maxLength(500)] : [Validators.maxLength(500)]],
  });

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const reason = String(this.form.value.reason ?? '').trim();
    this.dialogRef.close(reason);
  }
}
