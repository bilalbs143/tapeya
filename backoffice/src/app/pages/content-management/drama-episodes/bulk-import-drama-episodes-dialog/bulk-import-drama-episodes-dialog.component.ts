import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { from, of } from 'rxjs';
import { catchError, concatMap, finalize, map, toArray } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { DramaEpisodeService } from 'src/app/services/drama-episode.service';
import type { DramaSerial } from 'src/app/services/drama-serial.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import {
  FileUploadComponent,
  type FileUploadValue,
  fileUploadRequired,
} from 'src/app/shared/components/file-upload/file-upload.component';

export interface BulkImportDramaEpisodesDialogData {
  serials: DramaSerial[];
  /** Prefill when the episodes list is filtered to one serial. */
  preferredSerialId?: number | null;
}

type ImportRowResult = {
  fileName: string;
  episodeNumber: number;
  title: string;
  ok: boolean;
  error?: string;
};

@Component({
  selector: 'app-bulk-import-drama-episodes-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './bulk-import-drama-episodes-dialog.component.html',
})
export class BulkImportDramaEpisodesDialogComponent {
  public readonly data = inject<BulkImportDramaEpisodesDialogData>(MAT_DIALOG_DATA);
  private readonly episodeService = inject(DramaEpisodeService);
  private readonly mediaService = inject(MediaService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject(MatDialogRef<BulkImportDramaEpisodesDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);

  public form: FormGroup = this.fb.group({
    drama_serial_id: [this.data.preferredSerialId ?? '', [Validators.required]],
    start_episode_number: [1, [Validators.required, Validators.min(1)]],
    videos: [null as FileUploadValue | null, [fileUploadRequired]],
  });

  public isSubmitting = false;
  public progressLabel = '';
  public uploadPercent: number | null = null;
  public lastResults: ImportRowResult[] | null = null;

  public get previewRows(): { episodeNumber: number; title: string; fileName: string }[] {
    const videos = this.form.get('videos')?.value as FileUploadValue | null;
    const files = this.sortFiles(videos?.files ?? []);
    const start = Number(this.form.get('start_episode_number')?.value) || 1;
    return files.map((file, i) => {
      const episodeNumber = start + i;
      return {
        episodeNumber,
        title: `Episode ${episodeNumber}`,
        fileName: file.name,
      };
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const serialId = Number(raw.drama_serial_id);
    const start = Number(raw.start_episode_number);
    const files = this.sortFiles((raw.videos as FileUploadValue | null)?.files ?? []);
    if (!files.length) {
      this.messageService.error('Select at least one video file.');
      return;
    }

    this.isSubmitting = true;
    this.form.disable({ emitEvent: false });
    this.lastResults = null;
    this.uploadPercent = null;
    this.progressLabel = `Importing 0 / ${files.length}…`;

    let completed = 0;
    from(files)
      .pipe(
        concatMap((file, index) => {
          const episodeNumber = start + index;
          const title = `Episode ${episodeNumber}`;
          this.uploadPercent = 0;
          this.progressLabel = `File ${index + 1} / ${files.length}: ${title}`;
          return this.episodeService
            .create(
              {
                drama_serial_id: serialId,
                episode_number: episodeNumber,
                title,
                description: null,
                video_source: 'upload',
                is_active: true,
              },
              { silent: true }
            )
            .pipe(
              concatMap((res) => {
                const episodeId = res.data.id;
                return this.mediaService
                  .uploadField('drama-episode', episodeId, 'video', file, (percent) => {
                    this.uploadPercent = percent;
                    this.progressLabel = `File ${index + 1} / ${files.length}: ${title} — ${percent}%`;
                  })
                  .pipe(
                    map(
                      (): ImportRowResult => ({
                        fileName: file.name,
                        episodeNumber,
                        title,
                        ok: true,
                      })
                    ),
                    catchError((err: unknown) =>
                      // Roll back the empty episode so failed rows do not leave orphans.
                      this.episodeService.delete(episodeId, { silent: true }).pipe(
                        catchError(() => of(undefined)),
                        map(() => this.toFailResult(file.name, episodeNumber, title, err))
                      )
                    )
                  );
              }),
              catchError((err: unknown) => of(this.toFailResult(file.name, episodeNumber, title, err))),
              finalize(() => {
                completed += 1;
                this.uploadPercent = null;
                this.progressLabel = `Completed ${completed} / ${files.length}…`;
              })
            );
        }),
        toArray(),
        finalize(() => {
          this.isSubmitting = false;
          this.form.enable({ emitEvent: false });
          this.progressLabel = '';
          this.uploadPercent = null;
        })
      )
      .subscribe({
        next: (results) => {
          this.lastResults = results;
          const ok = results.filter((r) => r.ok).length;
          const failed = results.length - ok;
          if (failed === 0) {
            this.messageService.success(`Imported ${ok} episode(s).`);
            this.dialogRef.close(true);
            return;
          }
          this.messageService.error(`Imported ${ok}, failed ${failed}. See the list below.`);
        },
      });
  }

  private toFailResult(fileName: string, episodeNumber: number, title: string, err: unknown): ImportRowResult {
    const message =
      (err as { error?: { message?: string } })?.error?.message || (err as Error)?.message || 'Failed to import this file.';
    return { fileName, episodeNumber, title, ok: false, error: message };
  }

  public closeAfterPartial(): void {
    const anyOk = this.lastResults?.some((r) => r.ok) ?? false;
    this.dialogRef.close(anyOk);
  }

  private sortFiles(files: File[]): File[] {
    return [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }
}
