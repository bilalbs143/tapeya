import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize, switchMap } from 'rxjs/operators';

import { MediaService } from 'src/app/services/media.service';
import type { Brand } from 'src/app/services/shop/brand.service';
import { BrandService } from 'src/app/services/shop/brand.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageBrandDialogData {
  mode: 'create' | 'edit';
  brand?: Brand;
}

@Component({
  selector: 'app-manage-brand-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    FileUploadComponent,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-brand-dialog.component.html',
})
export class ManageBrandDialogComponent {
  public readonly data = inject<ManageBrandDialogData>(MAT_DIALOG_DATA);
  private readonly brandService = inject(BrandService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageBrandDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;

  private readonly originalHasLogo = !!this.data.brand?.logo;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Brand' : 'Add Brand';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  constructor() {
    this.initializeForm();
    this.form.get('name')?.valueChanges.subscribe((name) => {
      this.form.patchValue({ slug: toKebabCase(name) }, { emitEvent: false });
    });
  }

  private initializeForm(): void {
    const brand = this.data.brand;
    this.form = this.fb.group({
      name: [brand?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      slug: [brand?.slug ?? '', [Validators.required]],
      sort_order: [brand?.sort_order ?? 0, [Validators.min(0)]],
      is_active: [brand?.is_active ?? true],
      // logo: FileUploadValue | null — null means nothing selected/kept.
      // Initialise with existing URL so the component shows the current logo.
      logo: [brand?.logo ? ({ files: [], existingUrls: [brand.logo] } as FileUploadValue) : null],
    });
    this.form.patchValue({ slug: toKebabCase(this.form.get('name')?.value) }, { emitEvent: false });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    const raw = this.form.getRawValue();
    formData.append('name', raw.name);
    formData.append('slug', (raw.slug ?? '').trim());
    formData.append('sort_order', String(raw.sort_order ?? 0));
    formData.append('is_active', raw.is_active ? '1' : '0');

    const logoValue = raw.logo as FileUploadValue | null;

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create' ? this.brandService.create(formData) : this.brandService.update(this.data.brand!.id, formData);

    request$
      .pipe(
        switchMap((res) => this.mediaService.applyField('brand', res.data.id, 'logo', logoValue, this.originalHasLogo)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.dialogRef.close(false),
      });
  }
}
