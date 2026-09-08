import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import { LiveStreamService, type YoutubeStreamKeyDetail } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

type CopyField = 'rtmp' | 'key';

/**
 * One-time provisioning dialog — calls the real YouTube API once to mint a new, permanent
 * ingest key, then reveals it once so the admin can paste it into OBS/vMix. The key itself
 * always stays fetchable again later from the key's own "View" action.
 */
@Component({
  selector: 'app-create-youtube-stream-key-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './create-youtube-stream-key-dialog.component.html',
})
export class CreateYoutubeStreamKeyDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<CreateYoutubeStreamKeyDialogComponent, boolean>>(MatDialogRef);
  private readonly streamApi = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting = false;
  public created: YoutubeStreamKeyDetail | null = null;
  public copiedField: CopyField | null = null;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  public submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const title = (this.form.getRawValue().title as string).trim();

    this.streamApi.createYoutubeStreamKey(title).subscribe({
      next: (key) => {
        this.isSubmitting = false;
        this.created = key;
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.messageService.httpError(err, 'Failed to create YouTube stream key. Please try again.');
      },
    });
  }

  public copyField(field: CopyField, value: string | null | undefined): void {
    if (!value?.trim()) {
      return;
    }
    void navigator.clipboard.writeText(value).then(() => {
      this.copiedField = field;
      this.snackBar.open('Copied to clipboard', undefined, { duration: 2000 });
      setTimeout(() => {
        if (this.copiedField === field) {
          this.copiedField = null;
        }
      }, 2500);
    });
  }

  public done(): void {
    this.dialogRef.close(true);
  }
}
