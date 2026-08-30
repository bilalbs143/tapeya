import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialModule } from 'src/app/material.module';
import { CommonSharedModule } from 'src/app/shared/common.module';

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
  imports: [ReactiveFormsModule, MaterialModule, CommonSharedModule],
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
