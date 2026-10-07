import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { DramaSerial } from 'src/app/services/drama-serial.service';
import { DramaSerialService } from 'src/app/services/drama-serial.service';
import { MediaService } from 'src/app/services/media.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';

export interface ManageDramaSerialDialogData {
  mode: 'create' | 'edit';
  serial?: DramaSerial;
}

@Component({
  selector: 'app-manage-drama-serial-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './manage-drama-serial-dialog.component.html',
})
export class ManageDramaSerialDialogComponent {
  public readonly data = inject<ManageDramaSerialDialogData>(MAT_DIALOG_DATA);
  private readonly serialService = inject(DramaSerialService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageDramaSerialDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  private readonly originalHasPoster = !!this.data.serial?.poster;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Drama Serial' : 'Add Drama Serial';
  }

  constructor() {
    const s = this.data.serial;
    this.form = this.fb.group({
      title: [s?.title ?? '', [Validators.required, Validators.maxLength(255)]],
      description: [s?.description ?? '', [Validators.maxLength(5000)]],
      is_active: [s?.is_active ?? true],
      poster: [s?.poster ? ({ files: [], existingUrls: [s.poster] } as FileUploadValue) : null],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const posterVal = raw.poster as FileUploadValue | null;
    const payload = {
      title: raw.title.trim(),
      description: raw.description?.trim() || null,
      is_active: raw.is_active ?? true,
    };

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create' ? this.serialService.create(payload) : this.serialService.update(this.data.serial!.id, payload);

    request$
      .pipe(
        switchMap((res) =>
          this.mediaService.applyField('drama-serial', res.data.id, 'poster', posterVal, this.originalHasPoster)
        ),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => undefined,
      });
  }
}
