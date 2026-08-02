import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs/operators';

import type { PostType, AdminPost, PostStatus, PostVisibility } from 'src/app/services/post.service';
import { PostService } from 'src/app/services/post.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { PostContentPreviewComponent } from 'src/app/shared/components/post-content-preview/post-content-preview.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface ManagePostDialogData {
  post: AdminPost;
}

const POST_STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'uploading', label: 'Uploading' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'removed', label: 'Removed' },
];

const POST_VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'followers', label: 'Followers' },
  { value: 'private', label: 'Private' },
];

const TYPE_LABELS: Record<PostType, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  repost: 'Repost',
};

@Component({
  selector: 'app-manage-post-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DialogWrapperComponent,
    PostContentPreviewComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-post-dialog.component.html',
})
export class ManagePostDialogComponent {
  public readonly data = inject<ManagePostDialogData>(MAT_DIALOG_DATA);
  private readonly postService = inject(PostService);
  private readonly dialogRef = inject<MatDialogRef<ManagePostDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public readonly statusOptions = POST_STATUS_OPTIONS;
  public readonly visibilityOptions = POST_VISIBILITY_OPTIONS;

  public get post(): AdminPost {
    return this.data.post;
  }

  constructor() {
    const post = this.data.post;
    this.form = this.fb.group({
      status: [post.status, [Validators.required]],
      visibility: [post.visibility, [Validators.required]],
      caption: [post.body ?? post.caption ?? '', [Validators.maxLength(2200)]],
    });
  }

  public typeLabel(): string {
    const type = this.post.type;
    if (!type) return this.emptyCell;
    return TYPE_LABELS[type] ?? type;
  }

  public creatorLabel(): string {
    const creator = this.post.creator;
    if (!creator) return this.emptyCell;
    return creator.nickname || creator.name || this.emptyCell;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      status: raw.status as PostStatus,
      visibility: raw.visibility as PostVisibility,
      body: raw.caption?.trim() || null,
    };

    this.isSubmitting = true;
    this.postService
      .update(this.post.id, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          // Validation/API errors are handled by the global error interceptor
        },
      });
  }
}
