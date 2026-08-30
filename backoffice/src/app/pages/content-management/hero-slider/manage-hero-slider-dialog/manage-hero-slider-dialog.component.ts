import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import type { HeroSlider, HeroSliderCtaType } from 'src/app/services/hero-slider.service';
import { HeroSliderService } from 'src/app/services/hero-slider.service';
import { MediaService } from 'src/app/services/media.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManageHeroSliderDialogData {
  mode: 'create' | 'edit';
  heroSlider?: HeroSlider;
}

const HTTP_URL_PATTERN = /^https?:\/\/.+/i;
const APP_PATH_PATTERN = /^\/(?!\/)\S*$/;
const INTEREST_CAMPAIGN_KEY = 'interestCampaign';

function inferCtaType(slide?: HeroSlider): HeroSliderCtaType {
  if (slide?.cta_type) return slide.cta_type;
  if (slide?.cta_dialog_key) return 'dialog';
  if (slide?.cta_url) return 'url';
  return 'none';
}

function setControlErrors(ctrl: AbstractControl | null, next: ValidationErrors | null): void {
  if (!ctrl) return;
  const current = ctrl.errors;
  const same =
    (current == null && next == null) || (current != null && next != null && JSON.stringify(current) === JSON.stringify(next));
  if (same) return;
  ctrl.setErrors(next);
}

function ctaTypeValidator(group: AbstractControl): ValidationErrors | null {
  const type = (group.get('cta_type')?.value ?? 'none') as HeroSliderCtaType;
  const urlCtrl = group.get('cta_url');
  const keyCtrl = group.get('cta_dialog_key');
  const paramCtrl = group.get('cta_dialog_param');
  const url = (urlCtrl?.value ?? '').toString().trim();
  const dialogKey = (keyCtrl?.value ?? '').toString().trim();
  const dialogParam = (paramCtrl?.value ?? '').toString().trim();
  const openExternal = group.get('cta_target_blank')?.value !== false;

  let urlErrors: ValidationErrors | null = null;
  let keyErrors: ValidationErrors | null = null;
  let paramErrors: ValidationErrors | null = null;

  if (type === 'url') {
    if (!url) urlErrors = { required: true };
    else if (openExternal && !HTTP_URL_PATTERN.test(url)) urlErrors = { ctaUrlExternal: true };
    else if (!openExternal && !APP_PATH_PATTERN.test(url)) urlErrors = { ctaUrlInternal: true };
  } else if (type === 'dialog') {
    if (!dialogKey) keyErrors = { required: true };
    if (dialogKey === INTEREST_CAMPAIGN_KEY && !dialogParam) paramErrors = { required: true };
  }

  setControlErrors(urlCtrl, urlErrors);
  setControlErrors(keyCtrl, keyErrors);
  setControlErrors(paramCtrl, paramErrors);

  return urlErrors || keyErrors || paramErrors;
}

@Component({
  selector: 'app-manage-hero-slider-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './manage-hero-slider-dialog.component.html',
})
export class ManageHeroSliderDialogComponent {
  public readonly data = inject<ManageHeroSliderDialogData>(MAT_DIALOG_DATA);
  private readonly heroSliderService = inject(HeroSliderService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject<MatDialogRef<ManageHeroSliderDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly enumsService = inject(EnumsService);
  private readonly destroyRef = inject(DestroyRef);

  public form!: FormGroup;
  public isSubmitting = false;

  private readonly originalHasMobile = !!this.data.heroSlider?.image_mobile;
  private readonly originalHasDesktop = !!this.data.heroSlider?.image_desktop;

  public readonly statusOptions$ = this.enumsService.getOptions('status');
  public readonly ctaTypeOptions$ = this.enumsService.getOptions('hero_slider_cta_type');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Hero Slide' : 'Add Hero Slide';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get ctaType(): HeroSliderCtaType {
    return (this.form?.get('cta_type')?.value ?? 'none') as HeroSliderCtaType;
  }

  public get isInterestCampaign(): boolean {
    return this.form?.get('cta_dialog_key')?.value === INTEREST_CAMPAIGN_KEY;
  }

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    const slide = this.data.heroSlider;
    const type = inferCtaType(slide);
    this.form = this.fb.group({
      image_mobile: [
        slide?.image_mobile ? ({ files: [], existingUrls: [slide.image_mobile] } as FileUploadValue) : null,
        this.data.mode === 'create' ? [Validators.required] : [],
      ],
      image_desktop: [slide?.image_desktop ? ({ files: [], existingUrls: [slide.image_desktop] } as FileUploadValue) : null],
      status: [normalizeEnumValue(slide?.status_enum, 'active'), [Validators.required]],
      cta_type: [type, [Validators.required]],
      cta_label: [slide?.cta_label ?? ''],
      cta_url: [slide?.cta_url ?? ''],
      cta_target_blank: [{ value: slide?.cta_target_blank ?? true, disabled: type !== 'url' }],
      cta_dialog_key: [slide?.cta_dialog_key ?? ''],
      cta_dialog_param: [slide?.cta_dialog_param ?? ''],
    });
    this.form.setValidators(ctaTypeValidator);
    this.form.updateValueAndValidity();

    this.form
      .get('cta_type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncCtaTargetBlankControl());
    this.form
      .get('cta_target_blank')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.updateValueAndValidity({ emitEvent: false }));
    this.form
      .get('cta_dialog_key')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.updateValueAndValidity({ emitEvent: false }));
  }

  private syncCtaTargetBlankControl(): void {
    const control = this.form.get('cta_target_blank');
    if (!control) return;
    if (this.ctaType === 'url' && control.disabled) {
      control.enable({ emitEvent: false });
    } else if (this.ctaType !== 'url' && control.enabled) {
      control.disable({ emitEvent: false });
    }
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const mobileVal = raw.image_mobile as FileUploadValue | null;
    const desktopVal = raw.image_desktop as FileUploadValue | null;
    const type = (raw.cta_type ?? 'none') as HeroSliderCtaType;

    const payload = {
      status: raw.status ?? 'active',
      cta_type: type,
      cta_label: type === 'none' ? null : (raw.cta_label ?? '').trim() || null,
      cta_url: type === 'url' ? (raw.cta_url ?? '').trim() || null : null,
      cta_target_blank: type === 'url' ? Boolean(raw.cta_target_blank) : true,
      cta_dialog_key: type === 'dialog' ? (raw.cta_dialog_key ?? '').trim() || null : null,
      cta_dialog_param:
        type === 'dialog' && raw.cta_dialog_key === INTEREST_CAMPAIGN_KEY ? (raw.cta_dialog_param ?? '').trim() || null : null,
    };

    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.heroSliderService.create(payload)
        : this.heroSliderService.update(this.data.heroSlider!.id, payload);

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
