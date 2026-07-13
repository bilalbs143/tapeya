import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { LiveStreamService, type LiveStreamProvider } from 'src/app/services/live-stream.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { LIVE_STREAM_THUMBNAIL_UPLOAD_HINT } from 'src/app/shared/constants/thumbnail.constants';

export interface LiveStreamCreateDialogResult {
  saved: boolean;
  streamId?: number;
  provider?: LiveStreamProvider;
}

@Component({
  selector: 'app-live-stream-create-dialog',
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
    DialogWrapperComponent,
    FileUploadComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './live-stream-create-dialog.component.html',
})
export class LiveStreamCreateDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<LiveStreamCreateDialogComponent, LiveStreamCreateDialogResult>>(MatDialogRef);
  private readonly streamApi = inject(LiveStreamService);
  private readonly mediaService = inject(MediaService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  public readonly providerOptions: { value: LiveStreamProvider; label: string }[] = [
    { value: 'youtube', label: 'YouTube RTMP (OBS / vMix)' },
    { value: 'external', label: 'External URL (YouTube / HLS Link)' },
  ];

  public form: FormGroup;
  public isSubmitting = false;
  public readonly streamThumbnailHint = LIVE_STREAM_THUMBNAIL_UPLOAD_HINT;

  constructor() {
    this.form = this.fb.group({
      provider: ['youtube' as LiveStreamProvider, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      streaming_url: ['', Validators.maxLength(2048)],
      privacy: ['public' as 'public' | 'unlisted'],
      thumbnail: [null as FileUploadValue | null],
    });

    this.form.get('provider')?.valueChanges.subscribe(() => this.applyProviderValidators());
    this.applyProviderValidators();
  }

  public get isYoutube(): boolean {
    return this.form.get('provider')?.value === 'youtube';
  }

  public submit(): void {
    this.applyProviderValidators();

    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const value = this.form.getRawValue();
    const provider = value.provider as LiveStreamProvider;

    const body =
      provider === 'youtube'
        ? {
            provider,
            title: value.title.trim(),
            description: value.description?.trim() || null,
            privacy: value.privacy,
          }
        : {
            provider,
            title: value.title.trim(),
            description: value.description?.trim() || null,
            streaming_url: value.streaming_url.trim(),
          };

    const thumbnailVal = value.thumbnail as FileUploadValue | null;

    this.streamApi
      .createStandaloneStream(body)
      .pipe(
        switchMap((payload) => {
          const streamId = payload.stream?.id;
          if (!streamId) {
            return of(payload);
          }

          return this.mediaService.applyField('live-stream', streamId, 'thumbnail', thumbnailVal, false).pipe(map(() => payload));
        }),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (payload) => {
          this.messageService.success(
            provider === 'youtube' ? 'Live stream created. Copy RTMP settings into OBS or vMix.' : 'Live stream created.'
          );
          this.dialogRef.close({
            saved: true,
            streamId: payload.stream?.id,
            provider,
          });
        },
        error: () => this.messageService.error('Failed to create live stream. Please try again.'),
      });
  }

  private applyProviderValidators(): void {
    const urlControl = this.form.get('streaming_url');
    if (!urlControl) {
      return;
    }

    if (this.isYoutube) {
      urlControl.clearValidators();
      urlControl.setValidators([Validators.maxLength(2048)]);
    } else {
      urlControl.setValidators([Validators.required, Validators.maxLength(2048)]);
    }

    urlControl.updateValueAndValidity({ emitEvent: false });
  }
}
