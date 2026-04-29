import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, type Toolbar } from 'ngx-editor';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import type { EnumOption } from 'src/app/services/enums.service';
import type { Brand } from 'src/app/services/shop/brand.service';
import { BrandService } from 'src/app/services/shop/brand.service';
import type { Category } from 'src/app/services/shop/category.service';
import { CategoryService } from 'src/app/services/shop/category.service';
import type { Product } from 'src/app/services/shop/product.service';
import { ProductService } from 'src/app/services/shop/product.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { NGX_EDITOR_TOOLBAR } from 'src/app/shared/constants/editor.constants';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageProductDialogData {
  mode: 'create' | 'edit';
  product?: Product;
}

@Component({
  selector: 'app-manage-product-dialog',
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
    MatDatepickerModule,
    TablerIconsModule,
    NgxEditorComponent,
    NgxEditorMenuComponent,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-product-dialog.component.html',
})
export class ManageProductDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageProductDialogData>(MAT_DIALOG_DATA);
  private readonly productService = inject(ProductService);
  private readonly brandService = inject(BrandService);
  private readonly categoryService = inject(CategoryService);
  private readonly enumsService = inject(EnumsService);
  private readonly dialogRef = inject<MatDialogRef<ManageProductDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public brands: Brand[] = [];
  public categories: Category[] = [];
  public selectedFiles: File[] = [];
  public previewUrls: string[] = [];
  public discountTypeOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('product_discount_type');
  public editor!: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Product' : 'Add Product';
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm();
    this.form.get('name')?.valueChanges.subscribe((name) => {
      this.form.patchValue({ slug: toKebabCase(name) }, { emitEvent: false });
    });
    this.loadBrands();
    this.loadCategories();
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeForm(): void {
    const p = this.data.product;
    this.form = this.fb.group({
      name: [p?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      slug: [p?.slug ?? '', [Validators.required]],
      description: [p?.description ?? '', [Validators.required]],
      price: [p?.price ?? 0, [Validators.required, Validators.min(0)]],
      brand_id: [p?.brand_id ?? null, [Validators.required]],
      category_id: [p?.category_id ?? null, [Validators.required]],
      stock_quantity: [p?.stock_quantity ?? 0, [Validators.required, Validators.min(0)]],
      low_stock_threshold: [p?.low_stock_threshold ?? 5, [Validators.required, Validators.min(0)]],
      is_active: [p?.is_active ?? true],
      is_featured: [p?.is_featured ?? false],
      is_popular: [p?.is_popular ?? false],
      is_special_offer: [p?.is_special_offer ?? false],
      discount_type: [p?.discount_type ?? ''],
      discount_value: [p?.discount_value ?? null, [Validators.min(0)]],
      discount_starts_at_date: [this.parseDateTimeToDate(p?.discount_starts_at)],
      discount_starts_at_time: [this.parseDateTimeToTime(p?.discount_starts_at)],
      discount_ends_at_date: [this.parseDateTimeToDate(p?.discount_ends_at)],
      discount_ends_at_time: [this.parseDateTimeToTime(p?.discount_ends_at)],
    });
    this.form.patchValue({ slug: toKebabCase(this.form.get('name')?.value) }, { emitEvent: false });
    this.applyDiscountValidators(this.form.get('discount_type')?.value);
    this.form.get('discount_type')?.valueChanges.subscribe((type) => this.applyDiscountValidators(type));
    if (p?.images?.length) {
      this.previewUrls = p.images.map((img) => img.path);
    }
  }

  /** When discount type is selected, require value (number min 0) and start/end dates. When cleared, clear discount fields. */
  private applyDiscountValidators(discountType: string | null): void {
    const hasDiscount = !!discountType;
    const valueValidators = hasDiscount ? [Validators.required, Validators.min(0)] : [Validators.min(0)];
    const dateValidators = hasDiscount ? [Validators.required] : [];
    this.form.get('discount_value')?.setValidators(valueValidators);
    this.form.get('discount_starts_at_date')?.setValidators(dateValidators);
    this.form.get('discount_starts_at_time')?.setValidators(dateValidators);
    this.form.get('discount_ends_at_date')?.setValidators(dateValidators);
    this.form.get('discount_ends_at_time')?.setValidators(dateValidators);
    if (!hasDiscount) {
      this.form.patchValue(
        {
          discount_value: null,
          discount_starts_at_date: null,
          discount_starts_at_time: '',
          discount_ends_at_date: null,
          discount_ends_at_time: '',
        },
        { emitEvent: false }
      );
    }
    this.form.get('discount_value')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('discount_starts_at_date')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('discount_starts_at_time')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('discount_ends_at_date')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('discount_ends_at_time')?.updateValueAndValidity({ emitEvent: false });
  }

  /** Parse API datetime string (YYYY-MM-DDTHH:mm or ISO) to Date for datepicker, or null. */
  private parseDateTimeToDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  /** Parse API datetime string to time input value HH:mm. */
  private parseDateTimeToTime(value: string | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  /** Build API datetime string from date picker date and time input (HH:mm). */
  public toDateTimeString(date: Date | null, time: string | null): string {
    if (!date || !time) return '';
    const [h = '0', m = '0'] = (time ?? '').split(':');
    const d = new Date(date);
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return d.toISOString().slice(0, 16);
  }

  public get hasDiscountTypeSelected(): boolean {
    return !!this.form.get('discount_type')?.value;
  }

  private loadBrands(): void {
    this.brandService
      .getList({ all: true, sort: 'name' })
      .subscribe({
        next: (res) => (this.brands = res.data ?? []),
      });
  }

  private loadCategories(): void {
    this.categoryService
      .getList({ all: true, sort: 'sort_order' })
      .subscribe({
        next: (res) => (this.categories = res.data ?? []),
      });
  }

  public onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    this.showImagesError = false;
    const newFiles = Array.from(files);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    this.selectedFiles.push(...newFiles);
    this.previewUrls.push(...newUrls);
    input.value = '';
  }

  public removeNewFile(index: number): void {
    if (index >= 0 && index < this.selectedFiles.length) {
      if (this.previewUrls[this.existingImageCount + index]) {
        URL.revokeObjectURL(this.previewUrls[this.existingImageCount + index]);
      }
      this.selectedFiles.splice(index, 1);
      this.previewUrls.splice(this.existingImageCount + index, 1);
    }
  }

  public get existingImageCount(): number {
    return this.data.product?.images?.length ?? 0;
  }

  /** At least one image required: existing when editing or new files. */
  public get hasAtLeastOneImage(): boolean {
    return this.existingImageCount + this.selectedFiles.length >= 1;
  }

  public showImagesError = false;

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.hasAtLeastOneImage) {
      this.showImagesError = true;
      return;
    }
    this.showImagesError = false;
    const formData = new FormData();
    const raw = this.form.getRawValue();
    formData.append('name', raw.name);
    formData.append('slug', (raw.slug ?? '').trim());
    formData.append('description', raw.description ?? '');
    formData.append('price', String(raw.price));
    formData.append('brand_id', String(raw.brand_id));
    formData.append('category_id', String(raw.category_id));
    formData.append('stock_quantity', String(raw.stock_quantity ?? 0));
    formData.append('low_stock_threshold', String(raw.low_stock_threshold ?? 5));
    formData.append('is_active', raw.is_active ? '1' : '0');
    formData.append('is_featured', raw.is_featured ? '1' : '0');
    formData.append('is_popular', raw.is_popular ? '1' : '0');
    formData.append('is_special_offer', raw.is_special_offer ? '1' : '0');
    if (raw.discount_type) {
      formData.append('discount_type', raw.discount_type);
      if (raw.discount_value != null) formData.append('discount_value', String(raw.discount_value));
      const startsAt = this.toDateTimeString(raw.discount_starts_at_date, raw.discount_starts_at_time);
      const endsAt = this.toDateTimeString(raw.discount_ends_at_date, raw.discount_ends_at_time);
      if (startsAt) formData.append('discount_starts_at', startsAt);
      if (endsAt) formData.append('discount_ends_at', endsAt);
    }
    this.selectedFiles.forEach((file) => formData.append('images[]', file));

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.productService.create(formData)
        : this.productService.update(this.data.product!.id, formData);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false),
    });
  }
}
