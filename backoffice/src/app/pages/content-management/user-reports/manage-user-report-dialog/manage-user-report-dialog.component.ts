import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { UserReport, UserReportStatus } from 'src/app/services/user-report.service';
import { UserReportService } from 'src/app/services/user-report.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

export interface ManageUserReportDialogData {
  report: UserReport;
}

const REPORT_STATUS_OPTIONS: { value: UserReportStatus; label: string }[] = [
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
];

@Component({
  selector: 'app-manage-user-report-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './manage-user-report-dialog.component.html',
})
export class ManageUserReportDialogComponent {
  public readonly data = inject<ManageUserReportDialogData>(MAT_DIALOG_DATA);
  private readonly userReportService = inject(UserReportService);
  private readonly dialogRef = inject<MatDialogRef<ManageUserReportDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = REPORT_STATUS_OPTIONS;

  public get report(): UserReport {
    return this.data.report;
  }

  constructor() {
    this.form = this.fb.group({
      status: [this.report.status === 'open' ? 'reviewed' : this.report.status, [Validators.required]],
    });
  }

  public personLabel(person: UserReport['reporter']): string {
    if (!person) return this.emptyCell;
    return person.nickname || person.name || this.emptyCell;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const status = this.form.getRawValue().status as UserReportStatus;
    this.isSubmitting = true;
    this.userReportService
      .update(this.report.id, { status })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          // Validation/API errors are handled by the global error interceptor
        },
      });
  }
}
