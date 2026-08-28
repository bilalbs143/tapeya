import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs/operators';

import type { PostReport, PostReportStatus } from 'src/app/services/post-report.service';
import { PostReportService } from 'src/app/services/post-report.service';
import type { AdminPost } from 'src/app/services/post.service';
import { PostService } from 'src/app/services/post.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { PostContentPreviewComponent } from 'src/app/shared/components/post-content-preview/post-content-preview.component';
import { StatusChipComponent } from 'src/app/shared/components/status-chip/status-chip.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

export interface ManagePostReportDialogData {
  report: PostReport;
}

const REPORT_STATUS_OPTIONS: { value: PostReportStatus; label: string }[] = [
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
];

const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  repost: 'Repost',
};

@Component({
  selector: 'app-manage-post-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatSelectModule,
    DialogWrapperComponent,
    PostContentPreviewComponent,
    SubmitButtonComponent,
    LoaderComponent,
    StatusChipComponent,
  ],
  templateUrl: './manage-post-report-dialog.component.html',
})
export class ManagePostReportDialogComponent {
  public readonly data = inject<ManagePostReportDialogData>(MAT_DIALOG_DATA);
  private readonly postReportService = inject(PostReportService);
  private readonly postService = inject(PostService);
  private readonly dialogRef = inject<MatDialogRef<ManagePostReportDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public isLoadingPost = false;
  public postLoadFailed = false;
  public post: AdminPost | null = null;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = REPORT_STATUS_OPTIONS;

  public get report(): PostReport {
    return this.data.report;
  }

  constructor() {
    this.form = this.fb.group({
      status: [this.report.status === 'open' ? 'reviewed' : this.report.status, [Validators.required]],
    });

    const postId = this.report.post_id || this.report.post?.id;
    if (!postId) {
      this.postLoadFailed = true;
      return;
    }

    this.isLoadingPost = true;
    this.postService
      .getById(postId)
      .pipe(finalize(() => (this.isLoadingPost = false)))
      .subscribe({
        next: (res) => {
          this.post = res.data ?? null;
          if (!this.post) this.postLoadFailed = true;
        },
        error: () => {
          this.postLoadFailed = true;
        },
      });
  }

  public reporterLabel(): string {
    const reporter = this.report.reporter;
    if (!reporter) return this.emptyCell;
    return reporter.nickname || reporter.name || this.emptyCell;
  }

  public typeLabel(): string {
    const type = this.post?.type || this.report.post?.type;
    if (!type) return this.emptyCell;
    return TYPE_LABELS[type] ?? type;
  }

  public creatorLabel(): string {
    const creator = this.post?.creator;
    if (!creator) return this.emptyCell;
    return creator.nickname || creator.name || this.emptyCell;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const status = this.form.getRawValue().status as PostReportStatus;
    this.isSubmitting = true;
    this.postReportService
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
