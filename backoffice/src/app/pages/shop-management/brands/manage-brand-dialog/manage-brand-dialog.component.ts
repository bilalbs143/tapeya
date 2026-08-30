import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { MediaService } from 'src/app/services/media.service';
import type { Brand, SaveBrandPayload } from 'src/app/services/shop/brand.service';
import { BrandService } from 'src/app/services/shop/brand.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageBrandDialogData {
  mode: 'create' | 'edit';
  brand?: Brand;
}

@Component({
  selector: 'app-manage-brand-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
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
      logo: [brand?.logo ? ({ files: [], existingUrls: [brand.logo] } as FileUploadValue) : null],
    });
    this.form.patchValue({ slug: toKebabCase(this.form.get('name')?.value) }, { emitEvent: false });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: SaveBrandPayload = {
      name: raw.name,
      slug: (raw.slug ?? '').trim(),
      sort_order: Number(raw.sort_order ?? 0),
      is_active: !!raw.is_active,
    };

    const logoValue = raw.logo as FileUploadValue | null;

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create' ? this.brandService.create(payload) : this.brandService.update(this.data.brand!.id, payload);

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
