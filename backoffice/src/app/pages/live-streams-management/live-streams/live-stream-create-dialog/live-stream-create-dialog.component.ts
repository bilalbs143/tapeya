import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { CreateYoutubeStreamKeyDialogComponent } from '../../youtube-stream-keys/create-youtube-stream-key-dialog/create-youtube-stream-key-dialog.component';

import { MaterialModule } from 'src/app/material.module';
import { LiveStreamService, type LiveStreamProvider, type YoutubeStreamKey } from 'src/app/services/live-stream.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { LIVE_STREAM_THUMBNAIL_UPLOAD_HINT } from 'src/app/shared/constants/thumbnail.constants';

export interface LiveStreamCreateDialogResult {
  saved: boolean;
  streamId?: number;
  provider?: LiveStreamProvider;
}

@Component({
  selector: 'app-live-stream-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
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
  public availableKeys: YoutubeStreamKey[] = [];
  public loadingKeys = false;

  constructor() {
    this.form = this.fb.group({
      provider: ['youtube' as LiveStreamProvider, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      streaming_url: ['', Validators.maxLength(2048)],
      privacy: ['public' as 'public' | 'unlisted'],
      youtube_stream_key_id: [null as number | null],
      thumbnail: [null as FileUploadValue | null],
    });

    this.form.get('provider')?.valueChanges.subscribe(() => this.applyProviderValidators());
    this.applyProviderValidators();
    this.loadAvailableKeys();
  }

  public get isYoutube(): boolean {
    return this.form.get('provider')?.value === 'youtube';
  }

  public loadAvailableKeys(): void {
    this.loadingKeys = true;
    this.streamApi.listYoutubeStreamKeys().subscribe({
      next: (keys) => {
        this.availableKeys = keys.filter((key) => key.is_active && !key.in_use);
        this.loadingKeys = false;
      },
      error: () => {
        this.loadingKeys = false;
      },
    });
  }

  public openCreateKeyDialog(): void {
    this.messageService.openDialog<CreateYoutubeStreamKeyDialogComponent, boolean>(
      CreateYoutubeStreamKeyDialogComponent,
      {},
      (saved) => saved && this.loadAvailableKeys(),
      { widthSize: 'sm', disableClose: true }
    );
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
            youtube_stream_key_id: value.youtube_stream_key_id,
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
    const keyControl = this.form.get('youtube_stream_key_id');
    if (!urlControl || !keyControl) {
      return;
    }

    if (this.isYoutube) {
      urlControl.clearValidators();
      urlControl.setValidators([Validators.maxLength(2048)]);
      keyControl.setValidators([Validators.required]);
    } else {
      urlControl.setValidators([Validators.required, Validators.maxLength(2048)]);
      keyControl.clearValidators();
    }

    urlControl.updateValueAndValidity({ emitEvent: false });
    keyControl.updateValueAndValidity({ emitEvent: false });
  }
}
