import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { catchError, concatMap, finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { DramaEpisode, DramaVideoSource } from 'src/app/services/drama-episode.service';
import { DramaEpisodeService } from 'src/app/services/drama-episode.service';
import type { DramaSerial } from 'src/app/services/drama-serial.service';
import { MediaService } from 'src/app/services/media.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import {
  FileUploadComponent,
  type FileUploadValue,
  fileUploadRequired,
} from 'src/app/shared/components/file-upload/file-upload.component';

export interface ManageDramaEpisodeDialogData {
  mode: 'create' | 'edit';
  episode?: DramaEpisode;
  serials: DramaSerial[];
}

const YOUTUBE_URL_PATTERN = /youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/;

function youtubeUrlValidator(control: { value: string | null | undefined }) {
  const value = (control.value ?? '').trim();
  if (!value) return { required: true };
  return YOUTUBE_URL_PATTERN.test(value) ? null : { youtubeUrl: true };
}

@Component({
  selector: 'app-manage-drama-episode-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './manage-drama-episode-dialog.component.html',
})
export class ManageDramaEpisodeDialogComponent {
  public readonly data = inject<ManageDramaEpisodeDialogData>(MAT_DIALOG_DATA);
  private readonly episodeService = inject(DramaEpisodeService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageDramaEpisodeDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public uploadPercent: number | null = null;
  public uploadLabel = '';
  private readonly originalHasThumbnail = !!this.data.episode?.thumbnail;
  private readonly originalHasVideo = this.data.episode?.video_source === 'upload' && !!this.data.episode?.video;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Episode' : 'Add Episode';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get isYouTubeSource(): boolean {
    return this.form?.get('video_source')?.value === 'youtube';
  }

  public get isUploadSource(): boolean {
    return this.form?.get('video_source')?.value === 'upload';
  }

  constructor() {
    const e = this.data.episode;
    const videoSource: DramaVideoSource = e?.video_source ?? 'youtube';
    this.form = this.fb.group({
      drama_serial_id: [e?.drama_serial_id ?? '', [Validators.required]],
      episode_number: [e?.episode_number ?? 1, [Validators.required, Validators.min(1)]],
      title: [e?.title ?? '', [Validators.required, Validators.maxLength(255)]],
      description: [e?.description ?? '', [Validators.maxLength(5000)]],
      video_source: [videoSource, [Validators.required]],
      video_url: [videoSource === 'youtube' ? (e?.video ?? '') : ''],
      is_active: [e?.is_active ?? true],
      thumbnail: [e?.thumbnail ? ({ files: [], existingUrls: [e.thumbnail] } as FileUploadValue) : null],
      video: [videoSource === 'upload' && e?.video ? ({ files: [], existingUrls: [e.video] } as FileUploadValue) : null],
    });
    this.applyVideoSourceValidators(videoSource);
    this.form.get('video_source')!.valueChanges.subscribe((source: DramaVideoSource) => {
      this.applyVideoSourceValidators(source);
    });
  }

  private applyVideoSourceValidators(source: DramaVideoSource): void {
    const videoUrl = this.form.get('video_url')!;
    const video = this.form.get('video')!;
    if (source === 'youtube') {
      videoUrl.setValidators([youtubeUrlValidator, Validators.maxLength(2048)]);
      video.clearValidators();
      video.setValue(null);
    } else {
      videoUrl.clearValidators();
      videoUrl.setValue('');
      const videoValue = video.value as FileUploadValue | null;
      const hasExisting = (videoValue?.existingUrls?.length ?? 0) > 0;
      const needsUpload = !hasExisting && !(this.isEdit && this.originalHasVideo);
      video.setValidators(needsUpload ? [fileUploadRequired] : []);
    }
    videoUrl.updateValueAndValidity();
    video.updateValueAndValidity();
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const thumbnailVal = raw.thumbnail as FileUploadValue | null;
    const videoVal = raw.video as FileUploadValue | null;
    const videoSource = raw.video_source as DramaVideoSource;
    const payload = {
      drama_serial_id: Number(raw.drama_serial_id),
      episode_number: Number(raw.episode_number),
      title: raw.title.trim(),
      description: raw.description?.trim() || null,
      video_source: videoSource,
      ...(videoSource === 'youtube' ? { video: raw.video_url?.trim() || null } : {}),
      is_active: raw.is_active ?? true,
    };

    this.isSubmitting = true;
    this.uploadPercent = null;
    this.uploadLabel = '';
    const request$ =
      this.data.mode === 'create'
        ? this.episodeService.create(payload)
        : this.episodeService.update(this.data.episode!.id, payload);

    request$
      .pipe(
        switchMap((res) => {
          const id = res.data.id;
          const hasNewThumbnail = (thumbnailVal?.files?.length ?? 0) > 0;
          const hasNewVideo = videoSource === 'upload' && (videoVal?.files?.length ?? 0) > 0;

          const thumb$ = this.mediaService.applyField(
            'drama-episode',
            id,
            'thumbnail',
            thumbnailVal,
            this.originalHasThumbnail,
            hasNewThumbnail
              ? (percent) => {
                  this.uploadLabel = 'Uploading thumbnail…';
                  this.uploadPercent = percent;
                }
              : undefined
          );

          const video$ =
            videoSource === 'upload'
              ? this.mediaService.applyField(
                  'drama-episode',
                  id,
                  'video',
                  videoVal,
                  this.originalHasVideo,
                  hasNewVideo
                    ? (percent) => {
                        this.uploadLabel = 'Uploading video…';
                        this.uploadPercent = percent;
                      }
                    : undefined
                )
              : of(undefined);

          // Sequential so the progress bar reflects one file at a time.
          return thumb$.pipe(
            concatMap(() => video$),
            catchError((err) => {
              if (this.data.mode !== 'create') {
                return throwError(() => err);
              }
              // Roll back a brand-new episode if media upload fails.
              return this.episodeService.delete(id, { silent: true }).pipe(
                catchError(() => of(undefined)),
                switchMap(() => throwError(() => err))
              );
            })
          );
        }),
        finalize(() => {
          this.isSubmitting = false;
          this.uploadPercent = null;
          this.uploadLabel = '';
        })
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => undefined,
      });
  }
}
