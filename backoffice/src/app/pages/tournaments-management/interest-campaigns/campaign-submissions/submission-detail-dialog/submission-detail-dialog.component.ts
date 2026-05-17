import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { type InterestSubmission, InterestSubmissionService } from 'src/app/services/interest-submission.service';
import { MessageService } from 'src/app/services/message.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { birthdateAgeLine, cityCountryLine } from 'src/app/shared/functions/display.helper';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface SubmissionDetailDialogData {
  submission: InterestSubmission;
}

@Component({
  selector: 'app-submission-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDivider,
    TablerIconsModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './submission-detail-dialog.component.html',
})
export class SubmissionDetailDialogComponent implements OnInit {
  public readonly data = inject<SubmissionDetailDialogData>(MAT_DIALOG_DATA);
  private readonly submissionService = inject(InterestSubmissionService);
  private readonly enumsService = inject(EnumsService);
  private readonly dialogRef = inject<MatDialogRef<SubmissionDetailDialogComponent, boolean>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  public submission!: InterestSubmission;
  public form!: FormGroup;
  public isSubmitting = false;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('tournament_interest_submission_status');

  public ngOnInit(): void {
    this.submission = this.data.submission;
    this.form = this.fb.group({
      status: [this.submission.status, [Validators.required]],
    });
  }

  public cityCountryLine(): string {
    return cityCountryLine(this.submission.city, this.submission.country);
  }

  public dobAgeLine(): string {
    return birthdateAgeLine(this.submission.date_of_birth);
  }

  public onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    const { status } = this.form.value;
    this.submissionService
      .update(this.submission.id, { status })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.submission = res.data;
          this.dialogRef.close(true);
        },
        error: () => this.messageService.error('Failed to Update Submission.'),
      });
  }
}
