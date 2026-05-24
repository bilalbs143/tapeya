import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize, switchMap } from 'rxjs/operators';

import { MediaService } from 'src/app/services/media.service';
import type { Category } from 'src/app/services/shop/category.service';
import { CategoryService } from 'src/app/services/shop/category.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageCategoryDialogData {
  mode: 'create' | 'edit';
  category?: Category;
}

@Component({
  selector: 'app-manage-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    FileUploadComponent,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-category-dialog.component.html',
})
export class ManageCategoryDialogComponent implements OnInit {
  public readonly data = inject<ManageCategoryDialogData>(MAT_DIALOG_DATA);
  private readonly categoryService = inject(CategoryService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageCategoryDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public parentCategories: Category[] = [];

  private readonly originalHasImage = !!this.data.category?.image;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Category' : 'Add Category';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.form.get('name')?.valueChanges.subscribe((name) => {
      this.form.patchValue({ slug: toKebabCase(name) }, { emitEvent: false });
    });
    this.loadParentCategories();
  }

  private initializeForm(): void {
    const cat = this.data.category;
    this.form = this.fb.group({
      name: [cat?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      slug: [cat?.slug ?? '', [Validators.required]],
      parent_id: [cat?.parent_id ?? null],
      sort_order: [cat?.sort_order ?? 0, [Validators.min(0)]],
      is_active: [cat?.is_active ?? true],
      image: [cat?.image ? ({ files: [], existingUrls: [cat.image] } as FileUploadValue) : null],
    });
    this.form.patchValue({ slug: toKebabCase(this.form.get('name')?.value) }, { emitEvent: false });
  }

  private loadParentCategories(): void {
    this.categoryService.getList({ all: true, sort: 'sort_order' }).subscribe({
      next: (res) => {
        const list = res.data ?? [];
        const excludeId = this.data.category?.id;
        this.parentCategories = excludeId ? list.filter((c) => c.id !== excludeId) : list;
      },
    });
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
    if (raw.parent_id != null && raw.parent_id !== '') formData.append('parent_id', String(raw.parent_id));
    formData.append('sort_order', String(raw.sort_order ?? 0));
    formData.append('is_active', raw.is_active ? '1' : '0');

    const imageValue = raw.image as FileUploadValue | null;

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.categoryService.create(formData)
        : this.categoryService.update(this.data.category!.id, formData);

    request$
      .pipe(
        switchMap((res) => this.mediaService.applyField('category', res.data.id, 'image', imageValue, this.originalHasImage)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.dialogRef.close(false),
      });
  }
}
