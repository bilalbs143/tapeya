import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import type { HeroSlider } from 'src/app/services/hero-slider.service';
import { HeroSliderService } from 'src/app/services/hero-slider.service';
import { MediaService } from 'src/app/services/media.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManageHeroSliderDialogData {
  mode: 'create' | 'edit';
  heroSlider?: HeroSlider;
}

@Component({
  selector: 'app-manage-hero-slider-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatSelectModule,
    FileUploadComponent,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-hero-slider-dialog.component.html',
})
export class ManageHeroSliderDialogComponent {
  public readonly data = inject<ManageHeroSliderDialogData>(MAT_DIALOG_DATA);
  private readonly heroSliderService = inject(HeroSliderService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageHeroSliderDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly enumsService = inject(EnumsService);

  public form!: FormGroup;
  public isSubmitting = false;

  private readonly originalHasMobile = !!this.data.heroSlider?.image_mobile;
  private readonly originalHasDesktop = !!this.data.heroSlider?.image_desktop;

  public readonly statusOptions$ = this.enumsService.getOptions('status');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Hero Slide' : 'Add Hero Slide';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    const slide = this.data.heroSlider;
    // In create mode, image_mobile is required (no existing URL → control starts null → Validators.required fires).
    // In edit mode, pre-fill with the existing URL so the component shows the current image.
    this.form = this.fb.group({
      image_mobile: [
        slide?.image_mobile ? ({ files: [], existingUrls: [slide.image_mobile] } as FileUploadValue) : null,
        this.data.mode === 'create' ? [Validators.required] : [],
      ],
      image_desktop: [slide?.image_desktop ? ({ files: [], existingUrls: [slide.image_desktop] } as FileUploadValue) : null],
      status: [normalizeEnumValue(slide?.status_enum, 'active'), [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const mobileVal = raw.image_mobile as FileUploadValue | null;
    const desktopVal = raw.image_desktop as FileUploadValue | null;

    const formData = new FormData();
    formData.append('status', raw.status ?? 'active');

    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.heroSliderService.create(formData)
        : this.heroSliderService.update(this.data.heroSlider!.id, formData);

    request$
      .pipe(
        switchMap((res) =>
          forkJoin([
            this.mediaService.applyField('hero-slider', res.data.id, 'image_mobile', mobileVal, this.originalHasMobile),
            this.mediaService.applyField('hero-slider', res.data.id, 'image_desktop', desktopVal, this.originalHasDesktop),
          ])
        ),
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
