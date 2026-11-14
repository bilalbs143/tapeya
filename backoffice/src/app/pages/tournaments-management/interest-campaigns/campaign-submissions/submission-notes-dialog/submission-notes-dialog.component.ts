import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { type InterestSubmission, InterestSubmissionService } from 'src/app/services/interest-submission.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface SubmissionNotesDialogData {
  submission: InterestSubmission;
}

@Component({
  selector: 'app-submission-notes-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './submission-notes-dialog.component.html',
})
export class SubmissionNotesDialogComponent {
  public readonly data = inject<SubmissionNotesDialogData>(MAT_DIALOG_DATA);
  private readonly submissionService = inject(InterestSubmissionService);
  private readonly dialogRef = inject<MatDialogRef<SubmissionNotesDialogComponent, boolean>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public readonly form = this.fb.nonNullable.group({
    notes: [this.data.submission.notes ?? '', [Validators.maxLength(5000)]],
  });
  public isSubmitting = false;

  public get title(): string {
    const name = this.data.submission.name?.trim();
    return name ? `Notes — ${name}` : 'Submission Notes';
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const notes = this.form.controls.notes.value.trim() || null;
    this.isSubmitting = true;
    this.submissionService
      .update(this.data.submission.id, { notes })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => undefined,
      });
  }
}
