import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { Highlight, HighlightVideoSource } from 'src/app/services/highlight.service';
import { HighlightService } from 'src/app/services/highlight.service';
import { MediaService } from 'src/app/services/media.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import {
  FileUploadComponent,
  type FileUploadValue,
  fileUploadRequired,
} from 'src/app/shared/components/file-upload/file-upload.component';

export interface ManageHighlightDialogData {
  mode: 'create' | 'edit';
  highlight?: Highlight;
}

const YOUTUBE_URL_PATTERN = /youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/;

function youtubeUrlValidator(control: { value: string | null | undefined }) {
  const value = (control.value ?? '').trim();
  if (!value) {
    return { required: true };
  }
  return YOUTUBE_URL_PATTERN.test(value) ? null : { youtubeUrl: true };
}

@Component({
  selector: 'app-manage-highlight-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './manage-highlight-dialog.component.html',
})
export class ManageHighlightDialogComponent {
  public readonly data = inject<ManageHighlightDialogData>(MAT_DIALOG_DATA);
  private readonly highlightService = inject(HighlightService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageHighlightDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;

  private readonly originalHasThumbnail = !!this.data.highlight?.thumbnail;
  private readonly originalHasVideo = this.data.highlight?.video_source === 'upload' && !!this.data.highlight?.video;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Highlight' : 'Add Highlight';
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
    this.initializeForm();
  }

  private initializeForm(): void {
    const h = this.data.highlight;
    const videoSource: HighlightVideoSource = h?.video_source ?? 'youtube';

    this.form = this.fb.group({
      title: [h?.title ?? '', [Validators.required, Validators.maxLength(255)]],
      description: [h?.description ?? '', [Validators.maxLength(5000)]],
      video_source: [videoSource, [Validators.required]],
      video_url: [videoSource === 'youtube' ? (h?.video ?? '') : ''],
      duration: [h?.duration ?? '', [Validators.maxLength(32)]],
      is_active: [h?.is_active ?? true],
      thumbnail: [h?.thumbnail ? ({ files: [], existingUrls: [h.thumbnail] } as FileUploadValue) : null],
      video: [videoSource === 'upload' && h?.video ? ({ files: [], existingUrls: [h.video] } as FileUploadValue) : null],
    });

    this.applyVideoSourceValidators(videoSource);
    this.form.get('video_source')!.valueChanges.subscribe((source: HighlightVideoSource) => {
      this.applyVideoSourceValidators(source);
    });
  }

  private applyVideoSourceValidators(source: HighlightVideoSource): void {
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
    const videoSource = raw.video_source as HighlightVideoSource;

    const payload = {
      title: raw.title.trim(),
      description: raw.description?.trim() || null,
      video_source: videoSource,
      ...(videoSource === 'youtube' ? { video: raw.video_url?.trim() || null } : {}),
      duration: raw.duration?.trim() || null,
      is_active: raw.is_active ?? true,
    };

    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.highlightService.create(payload)
        : this.highlightService.update(this.data.highlight!.id, payload);

    request$
      .pipe(
        switchMap((res) => {
          const id = res.data.id;
          const mediaTasks = [
            this.mediaService.applyField('highlight', id, 'thumbnail', thumbnailVal, this.originalHasThumbnail),
          ];

          if (videoSource === 'upload') {
            mediaTasks.push(this.mediaService.applyField('highlight', id, 'video', videoVal, this.originalHasVideo));
          }

          return forkJoin(mediaTasks);
        }),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          // Validation/API errors are handled by the global error interceptor
        },
      });
  }
}
