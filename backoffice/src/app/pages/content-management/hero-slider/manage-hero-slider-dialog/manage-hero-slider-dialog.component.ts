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
  public selectedFile: File | null = null;
  public previewUrl: string | null = null;

  public readonly statusOptions$ = this.enumsService.getOptions('status');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Hero Slide' : 'Add Hero Slide';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get currentImageUrl(): string | null {
    return this.data.heroSlider?.image ?? this.previewUrl;
  }

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    const slide = this.data.heroSlider;
    this.form = this.fb.group({
      image: [null, this.data.mode === 'create' ? [Validators.required] : []],
      status: [normalizeEnumValue(slide?.status_enum, 'active'), [Validators.required]],
    });
    if (slide?.image) {
      this.previewUrl = slide.image;
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.previewUrl = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
    }
  }

  public clearFile(): void {
    this.selectedFile = null;
    this.previewUrl = this.data.heroSlider?.image ?? null;
    this.form.patchValue({ image: null });
    this.form.get('image')?.updateValueAndValidity();
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('status', this.form.get('status')?.value ?? 'active');
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.data.mode === 'create') {
      return;
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
