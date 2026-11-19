import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { BrandPartner, BrandPartnerSavePayload, BrandPartnerStatus } from 'src/app/services/ad/brand-partner.service';
import { BrandPartnerService } from 'src/app/services/ad/brand-partner.service';
import { MediaService } from 'src/app/services/media.service';
import type { Brand } from 'src/app/services/shop/brand.service';
import { BrandService } from 'src/app/services/shop/brand.service';
import { type UserSearchRow, UsersService } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SHOP_BRAND_LOGO_ASPECT } from 'src/app/shared/constants/thumbnail.constants';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageBrandPartnerDialogData {
  mode: 'create' | 'edit';
  partner?: BrandPartner;
}

const STATUS_OPTIONS: { value: BrandPartnerStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

@Component({
  selector: 'app-manage-brand-partner-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './manage-brand-partner-dialog.component.html',
})
export class ManageBrandPartnerDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageBrandPartnerDialogData>(MAT_DIALOG_DATA);
  private readonly brandPartnerService = inject(BrandPartnerService);
  private readonly brandService = inject(BrandService);
  private readonly usersService = inject(UsersService);
  private readonly mediaService = inject(MediaService);
  private readonly dialogRef = inject(MatDialogRef<ManageBrandPartnerDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public readonly logoAspect = SHOP_BRAND_LOGO_ASPECT;
  public readonly statusOptions = STATUS_OPTIONS;
  public readonly roleChipSeparatorKeys = [ENTER, COMMA] as const;
  public readonly roleChipInputAddOnBlur = false;
  public selectedUser: UserSearchRow | null = null;
  public userCandidates: UserSearchRow[] = [];
  public readonly userSearch = this.fb.nonNullable.control('');
  public shopBrands: Brand[] = [];

  private readonly originalLogo = this.data.partner?.logo_url ?? this.data.partner?.logo ?? null;
  private readonly originalHasLogo = !!this.originalLogo;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Brand Partner' : 'Add Brand Partner';
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadShopBrands();
    this.sub.add(
      this.form.get('name')!.valueChanges.subscribe((name) => {
        this.form.patchValue({ slug: toKebabCase(name ?? '') }, { emitEvent: false });
      })
    );
    this.sub.add(
      this.userSearch.valueChanges
        .pipe(
          startWith(this.userSearch.value),
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) =>
            this.usersService.adminUserSearch(term ?? '').pipe(catchError(() => of({ data: [] as UserSearchRow[] })))
          )
        )
        .subscribe((res) => {
          this.userCandidates = res.data ?? [];
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initializeForm(): void {
    const p = this.data.partner;
    this.form = this.fb.group({
      name: [p?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      slug: [p?.slug ?? '', [Validators.required]],
      user_id: [p?.user_id ?? 0, [Validators.required, Validators.min(1)]],
      contact_email: [p?.contact_email ?? '', [Validators.email]],
      status: [p?.status ?? 'draft', [Validators.required]],
      shop_brand_id: [p?.shop_brand_id ?? null],
      logo: [this.originalLogo ? ({ files: [], existingUrls: [this.originalLogo] } as FileUploadValue) : null],
    });

    if (p?.user) {
      this.selectedUser = {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        phone: p.user.phone ?? null,
        nickname: p.user.nickname,
      };
    }

    this.form.patchValue({ slug: toKebabCase(this.form.get('name')?.value ?? '') }, { emitEvent: false });
  }

  private loadShopBrands(): void {
    this.brandService.getList({ per_page: 100, page: 1 }).subscribe({
      next: (res) => (this.shopBrands = res.data ?? []),
      error: () => (this.shopBrands = []),
    });
  }

  public userChipLabel(u: UserSearchRow): string {
    const nick = u.nickname?.trim();
    if (nick) return nick;
    return u.name?.trim() || `#${u.id}`;
  }

  public userOptionLabel(c: UserSearchRow): string {
    const tail = c.email || c.phone || c.nickname || `#${c.id}`;
    return `${c.name} — ${tail}`;
  }

  public onUserChipInputTokenEnd(event: MatChipInputEvent): void {
    event.chipInput?.clear();
  }

  public onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as UserSearchRow;
    if (!user?.id) return;
    this.selectedUser = user;
    this.form.patchValue({ user_id: user.id });
    this.userSearch.setValue('', { emitEvent: false });
    this.userCandidates = [];
  }

  public removeUser(): void {
    this.selectedUser = null;
    this.form.patchValue({ user_id: 0 });
    this.userSearch.setValue('', { emitEvent: false });
    this.userCandidates = [];
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: BrandPartnerSavePayload = {
      name: String(raw.name).trim(),
      slug: (raw.slug ?? '').trim() || null,
      user_id: Number(raw.user_id),
      contact_email: (raw.contact_email ?? '').trim() || null,
      status: raw.status as BrandPartnerStatus,
      shop_brand_id: raw.shop_brand_id != null && raw.shop_brand_id !== '' ? Number(raw.shop_brand_id) : null,
    };

    const logoValue = raw.logo as FileUploadValue | null;
    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.brandPartnerService.create(payload)
        : this.brandPartnerService.update(this.data.partner!.id, payload);

    request$
      .pipe(
        switchMap((res) => this.mediaService.applyField('brand-partner', res.data.id, 'logo', logoValue, this.originalHasLogo)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          // Keep dialog open; HTTP interceptor shows the error toast.
        },
      });
  }
}
