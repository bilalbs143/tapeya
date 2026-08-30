import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import type { SupportMessage, SupportMessageStatus } from 'src/app/services/support-message.service';
import { SupportMessageService } from 'src/app/services/support-message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

export interface ManageSupportMessageDialogData {
  message: SupportMessage;
}

@Component({
  selector: 'app-manage-support-message-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './manage-support-message-dialog.component.html',
})
export class ManageSupportMessageDialogComponent {
  public readonly data = inject<ManageSupportMessageDialogData>(MAT_DIALOG_DATA);
  private readonly supportMessageService = inject(SupportMessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly dialogRef = inject<MatDialogRef<ManageSupportMessageDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public readonly emptyCell = EMPTY_CELL;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('support_message_status');

  public get message(): SupportMessage {
    return this.data.message;
  }

  constructor() {
    this.form = this.fb.group({
      status: [this.message.status, [Validators.required]],
    });
  }

  public submitterLabel(): string {
    return this.message.user?.name || this.message.name || this.emptyCell;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const status = this.form.getRawValue().status as SupportMessageStatus;
    this.isSubmitting = true;
    this.supportMessageService
      .update(this.message.id, { status })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          // Validation/API errors are handled by the global error interceptor
        },
      });
  }
}
