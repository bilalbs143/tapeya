import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, map, switchMap } from 'rxjs/operators';

import { liveStreamStatusLabel } from 'src/app/pages/tournaments-management/match-controller/live-stream.utils';
import {
  LiveStreamService,
  type LiveStreamListItem,
  type LiveStreamPayload,
  type LiveStreamStatus,
} from 'src/app/services/live-stream.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { LIVE_STREAM_THUMBNAIL_UPLOAD_HINT } from 'src/app/shared/constants/thumbnail.constants';

export interface LiveStreamManageDialogData {
  stream: LiveStreamListItem;
}

type StreamAction = 'save' | 'start' | 'end' | 'delete' | 'sync' | 'setup';
type CopyField = 'rtmp' | 'key' | 'backup';

const PROVIDER_LABELS: Record<string, string> = {
  external: 'External URL',
  youtube: 'YouTube RTMP',
};

@Component({
  selector: 'app-live-stream-manage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDivider,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DialogWrapperComponent,
    FileUploadComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './live-stream-manage-dialog.component.html',
})
export class LiveStreamManageDialogComponent implements OnInit {
  public readonly data = inject<LiveStreamManageDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<LiveStreamManageDialogComponent>>(MatDialogRef);
  private readonly streamApi = inject(LiveStreamService);
  private readonly mediaService = inject(MediaService);
  private readonly messageService = inject(MessageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public payload: LiveStreamPayload | null = null;
  public loading = true;
  public activeAction: StreamAction | null = null;
  public copiedField: CopyField | null = null;
  public mutated = false;
  public readonly streamThumbnailHint = LIVE_STREAM_THUMBNAIL_UPLOAD_HINT;
  private originalHasThumbnail = false;

  public ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      streaming_url: ['', Validators.maxLength(2048)],
      thumbnail: [null as FileUploadValue | null],
    });

    this.loadStream();
  }

  public get stream() {
    return this.payload?.stream ?? null;
  }

  public get ingest() {
    return this.payload?.ingest ?? null;
  }

  public get status(): LiveStreamStatus {
    return this.stream?.status ?? this.data.stream.status;
  }

  public get isExternal(): boolean {
    return this.stream?.provider === 'external';
  }

  public get isYoutube(): boolean {
    return this.stream?.provider === 'youtube';
  }

  public get isLive(): boolean {
    return this.status === 'live';
  }

  public get providerLabel(): string {
    const provider = this.stream?.provider ?? this.data.stream.provider;
    return PROVIDER_LABELS[provider] ?? provider;
  }

  public get copyFields(): { field: CopyField; label: string; value: string }[] {
    const ingest = this.ingest;
    if (!ingest) {
      return [];
    }

    const fields: { field: CopyField; label: string; value: string }[] = [
      { field: 'rtmp', label: 'RTMP URL', value: ingest.rtmp_url },
      { field: 'key', label: 'Stream Key', value: ingest.stream_key },
    ];

    if (ingest.backup_rtmp_url) {
      fields.push({ field: 'backup', label: 'Backup RTMP URL', value: ingest.backup_rtmp_url });
    }

    return fields;
  }

  public statusLabel(): string {
    return liveStreamStatusLabel(this.status);
  }

  public loadStream(): void {
    this.loading = true;
    this.streamApi.getStreamById(this.data.stream.id).subscribe({
      next: (payload) => {
        this.payload = payload;
        this.patchForm(payload);
        this.applyProviderValidators();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.error('Failed to load live stream.');
      },
    });
  }

  public save(): void {
    if (this.form.invalid || this.activeAction) {
      this.form.markAllAsTouched();
      return;
    }

    this.activeAction = 'save';
    const value = this.form.getRawValue();
    const thumbnailVal = value.thumbnail as FileUploadValue | null;

    this.streamApi
      .updateStream(this.data.stream.id, {
        title: value.title.trim(),
        description: value.description?.trim() || null,
        streaming_url: this.isExternal ? value.streaming_url.trim() : value.streaming_url?.trim() || null,
      })
      .pipe(
        switchMap((row) =>
          this.mediaService
            .applyField('live-stream', this.data.stream.id, 'thumbnail', thumbnailVal, this.originalHasThumbnail)
            .pipe(map(() => row))
        ),
        finalize(() => (this.activeAction = null))
      )
      .subscribe({
        next: (row) => {
          if (this.payload?.stream) {
            this.payload.stream = { ...this.payload.stream, ...row };
          }
          const hasNewFile = (thumbnailVal?.files?.length ?? 0) > 0;
          const hasExisting = (thumbnailVal?.existingUrls?.length ?? 0) > 0;
          this.originalHasThumbnail = hasNewFile || hasExisting;
          this.markMutated();
          this.messageService.success('Stream updated.');
        },
        error: () => this.messageService.error('Failed to update live stream. Please try again.'),
      });
  }

  public goLive(): void {
    this.activeAction = 'start';
    this.streamApi
      .startStream(this.data.stream.id)
      .pipe(finalize(() => (this.activeAction = null)))
      .subscribe({
        next: ({ status }) => {
          if (this.payload?.stream) {
            this.payload.stream.status = status;
          }
          this.markMutated();
          this.messageService.success('Stream is now live.');
        },
        error: () => this.messageService.error('Failed to start live stream. Please try again.'),
      });
  }

  public syncStatus(): void {
    this.activeAction = 'sync';
    this.streamApi
      .syncStreamById(this.data.stream.id)
      .pipe(finalize(() => (this.activeAction = null)))
      .subscribe({
        next: ({ status }) => {
          if (this.payload?.stream) {
            this.payload.stream.status = status;
          }
          this.markMutated();
          this.messageService.success(`Status synced: ${liveStreamStatusLabel(status)}`);
        },
        error: () => this.messageService.error('Failed to sync stream status. Please try again.'),
      });
  }

  public end(): void {
    this.activeAction = 'end';
    this.streamApi
      .endStreamById(this.data.stream.id)
      .pipe(finalize(() => (this.activeAction = null)))
      .subscribe({
        next: () => {
          if (this.payload?.stream) {
            this.payload.stream.status = 'ended';
          }
          this.markMutated();
          this.messageService.success('Stream ended.');
        },
        error: () => this.messageService.error('Failed to end live stream. Please try again.'),
      });
  }

  public newRtmpSetup(): void {
    if (this.isLive) {
      return;
    }

    const runSetup = () => {
      this.activeAction = 'setup';
      const value = this.form.getRawValue();

      this.streamApi
        .setupYoutubeStream(this.data.stream.id, {
          title: value.title.trim(),
          description: value.description?.trim() || null,
        })
        .pipe(finalize(() => (this.activeAction = null)))
        .subscribe({
          next: (payload) => {
            this.payload = payload;
            this.patchForm(payload);
            this.markMutated();
            this.messageService.success('New RTMP setup created. Copy credentials into OBS or vMix.');
          },
          error: () => this.messageService.error('Failed to create new RTMP setup. Please try again.'),
        });
    };

    if (this.stream?.provider_stream_id) {
      this.messageService
        .prompt(
          'Replace Stream Setup?',
          'This will delete the current YouTube broadcast and create a new one with fresh RTMP credentials.',
          'Replace',
          'Cancel'
        )
        .afterClosed()
        .subscribe((ok) => {
          if (ok) {
            runSetup();
          }
        });
      return;
    }

    runSetup();
  }

  public remove(): void {
    this.messageService
      .prompt('Delete Stream', 'Remove this live stream from Tapeya?', 'Delete', 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }

        this.activeAction = 'delete';
        this.streamApi
          .deleteStreamById(this.data.stream.id)
          .pipe(finalize(() => (this.activeAction = null)))
          .subscribe({
            next: () => {
              this.messageService.success('Stream deleted.');
              this.dialogRef.close(true);
            },
            error: () => this.messageService.error('Failed to delete live stream. Please try again.'),
          });
      });
  }

  public copyField(field: CopyField, value: string | null | undefined): void {
    if (!value?.trim()) {
      return;
    }

    void navigator.clipboard.writeText(value).then(() => {
      this.copiedField = field;
      this.snackBar.open('Copied To Clipboard', undefined, { duration: 2000 });
      setTimeout(() => {
        if (this.copiedField === field) {
          this.copiedField = null;
        }
      }, 2500);
    });
  }

  private patchForm(payload: LiveStreamPayload): void {
    const stream = payload.stream;
    if (!stream) {
      return;
    }

    this.originalHasThumbnail = !!payload.has_custom_thumbnail;

    this.form.patchValue({
      title: stream.title ?? '',
      description: stream.description ?? '',
      streaming_url: stream.streaming_url ?? '',
      thumbnail:
        payload.thumbnail_url && payload.has_custom_thumbnail
          ? ({ files: [], existingUrls: [payload.thumbnail_url] } as FileUploadValue)
          : null,
    });
  }

  private applyProviderValidators(): void {
    const urlControl = this.form.get('streaming_url');
    if (!urlControl) {
      return;
    }

    if (this.isExternal) {
      urlControl.setValidators([Validators.required, Validators.maxLength(2048)]);
    } else {
      urlControl.setValidators([Validators.maxLength(2048)]);
    }

    urlControl.updateValueAndValidity({ emitEvent: false });
  }

  private markMutated(): void {
    this.mutated = true;
  }
}
