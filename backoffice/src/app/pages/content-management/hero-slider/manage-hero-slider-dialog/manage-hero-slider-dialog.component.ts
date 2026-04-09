import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { finalize } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import type { HeroSlider } from 'src/app/services/hero-slider.service';
import { HeroSliderService } from 'src/app/services/hero-slider.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
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
    TablerIconsModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-hero-slider-dialog.component.html',
})
export class ManageHeroSliderDialogComponent {
  public readonly data = inject<ManageHeroSliderDialogData>(MAT_DIALOG_DATA);
  private readonly heroSliderService = inject(HeroSliderService);
  private readonly dialogRef = inject<MatDialogRef<ManageHeroSliderDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly enumsService = inject(EnumsService);

  public form!: FormGroup;
  public isSubmitting = false;
  public selectedFileMobile: File | null = null;
  public previewUrlMobile: string | null = null;
  public selectedFileDesktop: File | null = null;
  public previewUrlDesktop: string | null = null;

  public readonly statusOptions$ = this.enumsService.getOptions('status');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Hero Slide' : 'Add Hero Slide';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get mobilePreviewUrl(): string | null {
    return this.previewUrlMobile ?? this.data.heroSlider?.image_mobile ?? null;
  }

  public get desktopPreviewUrl(): string | null {
    return this.previewUrlDesktop ?? this.data.heroSlider?.image_desktop ?? null;
  }

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    const slide = this.data.heroSlider;
    this.form = this.fb.group({
      image_mobile: [null, this.data.mode === 'create' ? [Validators.required] : []],
      image_desktop: [null],
      status: [normalizeEnumValue(slide?.status_enum, 'active'), [Validators.required]],
    });
  }

  public onMobileFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFileMobile = file;
      this.previewUrlMobile = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrlMobile = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.form.patchValue({ image_mobile: file });
      this.form.get('image_mobile')?.updateValueAndValidity();
    }
  }

  public onDesktopFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFileDesktop = file;
      this.previewUrlDesktop = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrlDesktop = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.form.patchValue({ image_desktop: file });
    }
  }

  public clearMobileFile(): void {
    this.selectedFileMobile = null;
    this.previewUrlMobile = null;
    this.form.patchValue({ image_mobile: null });
    this.form.get('image_mobile')?.updateValueAndValidity();
  }

  public clearDesktopFile(): void {
    this.selectedFileDesktop = null;
    this.previewUrlDesktop = null;
    this.form.patchValue({ image_desktop: null });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.data.mode === 'create' && !this.selectedFileMobile) {
      return;
    }

    const formData = new FormData();
    formData.append('status', this.form.get('status')?.value ?? 'active');
    if (this.selectedFileMobile) {
      formData.append('image_mobile', this.selectedFileMobile);
    } else if (this.data.mode === 'create') {
      return;
    }
    if (this.selectedFileDesktop) {
      formData.append('image_desktop', this.selectedFileDesktop);
    }

    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.heroSliderService.create(formData)
        : this.heroSliderService.update(this.data.heroSlider!.id, formData);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        // Validation/API errors are handled by the global error interceptor
      },
    });
  }
}
