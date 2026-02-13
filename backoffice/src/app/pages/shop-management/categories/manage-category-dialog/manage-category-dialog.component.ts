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
import { TablerIconsModule } from 'angular-tabler-icons';
import { finalize } from 'rxjs/operators';

import type { Category } from 'src/app/services/shop/category.service';
import { CategoryService } from 'src/app/services/shop/category.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
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
    TablerIconsModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-category-dialog.component.html',
})
export class ManageCategoryDialogComponent implements OnInit {
  public readonly data = inject<ManageCategoryDialogData>(MAT_DIALOG_DATA);
  private readonly categoryService = inject(CategoryService);
  private readonly dialogRef = inject<MatDialogRef<ManageCategoryDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public selectedFile: File | null = null;
  public previewUrl: string | null = null;
  public parentCategories: Category[] = [];

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
      image: [null as File | null],
    });
    if (cat?.image) {
      this.previewUrl = cat.image;
    }
    this.form.patchValue({ slug: toKebabCase(this.form.get('name')?.value) }, { emitEvent: false });
  }

  private loadParentCategories(): void {
    this.categoryService.getList({ page: 1, per_page: 500, sort: 'sort_order' }).subscribe({
      next: (res) => {
        const list = res.data ?? [];
        const excludeId = this.data.category?.id;
        this.parentCategories = excludeId ? list.filter((c) => c.id !== excludeId) : list;
      },
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.previewUrl = URL.createObjectURL(file);
      this.form.patchValue({ image: file });
    }
  }

  public clearFile(): void {
    this.selectedFile = null;
    this.previewUrl = this.data.category?.image ?? null;
    this.form.patchValue({ image: null });
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
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.categoryService.create(formData)
        : this.categoryService.update(this.data.category!.id, formData);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false),
    });
  }
}
