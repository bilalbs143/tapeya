import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';

import type { Country } from 'src/app/services/location.service';
import { LocationService } from 'src/app/services/location.service';
import type { Vendor, VendorSavePayload } from 'src/app/services/shop/vendor.service';
import { VendorService } from 'src/app/services/shop/vendor.service';
import { type UserSearchRow, UsersService } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { toKebabCase } from 'src/app/shared/functions/slug.function';

export interface ManageVendorDialogData {
  mode: 'create' | 'edit';
  vendor?: Vendor;
}

@Component({
  selector: 'app-manage-vendor-dialog',
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
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-vendor-dialog.component.html',
})
export class ManageVendorDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageVendorDialogData>(MAT_DIALOG_DATA);
  private readonly vendorService = inject(VendorService);
  private readonly usersService = inject(UsersService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject(MatDialogRef<ManageVendorDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];
  public selectedUser: UserSearchRow | null = null;
  public userCandidates: UserSearchRow[] = [];
  public readonly userSearch = this.fb.nonNullable.control('');
  public readonly roleChipSeparatorKeys = [ENTER, COMMA] as const;
  public readonly roleChipInputAddOnBlur = false;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Vendor' : 'Add Vendor';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get userSelectDisabled(): boolean {
    return this.isEdit && !!this.data.vendor?.is_platform;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
    this.sub.add(this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName)));
    this.form.get('store_name')?.valueChanges.subscribe((name) => {
      this.form.patchValue({ slug: toKebabCase(name ?? '') }, { emitEvent: false });
    });

    if (!this.userSelectDisabled) {
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
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initializeForm(): void {
    const v = this.data.vendor;
    this.form = this.fb.group({
      user_id: [v?.user_id ?? 0, [Validators.required, Validators.min(1)]],
      store_name: [v?.store_name ?? '', [Validators.required, Validators.maxLength(255)]],
      slug: [v?.slug ?? '', [Validators.required]],
      description: [v?.description ?? ''],
      phone: [v?.phone ?? ''],
      email: [v?.email ?? '', [Validators.email]],
      address: [v?.address ?? ''],
      country: [v?.country ?? ''],
      // City starts disabled when no country is pre-selected; enabled reactively via loadCitiesForCountry.
      city: [{ value: v?.city ?? '', disabled: !v?.country }],
      commission_rate: [v?.commission_rate ?? null, [Validators.min(0), Validators.max(100)]],
      default_shipping_amount: [v?.default_shipping_amount ?? 0, [Validators.min(0)]],
      status: [v?.status === 'approved' ? 'approved' : 'pending'],
    });

    if (v?.user) {
      this.selectedUser = {
        id: v.user.id,
        name: v.user.name,
        email: v.user.email,
        phone: v.user.phone,
        nickname: null,
      };
    }

    if (this.userSelectDisabled) {
      this.form.get('user_id')?.disable({ emitEvent: false });
      this.userSearch.disable({ emitEvent: false });
    }

    // Status only editable on create
    if (this.isEdit) {
      this.form.get('status')?.disable({ emitEvent: false });
    }

    this.form.patchValue({ slug: toKebabCase(this.form.get('store_name')?.value ?? '') }, { emitEvent: false });
  }

  private loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (res) => {
        this.countriesList = res.data ?? [];
        const countryName = this.form.get('country')?.value;
        if (countryName) {
          this.loadCitiesForCountry(countryName, false);
        }
      },
      error: () => (this.countriesList = []),
    });
  }

  private loadCitiesForCountry(countryName: string | null, clearCity = true): void {
    const cityControl = this.form.get('city');

    if (!countryName) {
      this.cities = [];
      if (clearCity) cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    const country = this.countriesList.find((c) => c.name === countryName);
    const code = country?.country_code;
    if (!code) {
      this.cities = [];
      if (clearCity) cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    if (clearCity) cityControl?.setValue('');
    this.locationService.getCities(code).subscribe({
      next: (res) => {
        this.cities = res.data ?? [];
        cityControl?.enable();
      },
      error: () => {
        this.cities = [];
        cityControl?.disable();
      },
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
    if (this.userSelectDisabled) return;
    const user = event.option.value as UserSearchRow;
    if (!user?.id) return;
    this.selectedUser = user;
    this.form.patchValue({ user_id: user.id });
    this.userSearch.setValue('', { emitEvent: false });
    this.userCandidates = [];
  }

  public removeUser(): void {
    if (this.userSelectDisabled) return;
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
    const payload: VendorSavePayload = {
      user_id: Number(raw.user_id),
      store_name: String(raw.store_name).trim(),
      slug: (raw.slug ?? '').trim() || null,
      description: (raw.description ?? '').trim() || null,
      phone: (raw.phone ?? '').trim() || null,
      email: (raw.email ?? '').trim() || null,
      address: (raw.address ?? '').trim() || null,
      city: (raw.city ?? '').trim() || null,
      country: (raw.country ?? '').trim() || null,
      commission_rate:
        raw.commission_rate != null && String(raw.commission_rate).trim() !== '' ? Number(raw.commission_rate) : null,
      default_shipping_amount:
        raw.default_shipping_amount != null && String(raw.default_shipping_amount).trim() !== ''
          ? Number(raw.default_shipping_amount)
          : 0,
    };

    if (!this.isEdit) {
      payload.status = raw.status === 'approved' ? 'approved' : 'pending';
    }

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create' ? this.vendorService.create(payload) : this.vendorService.update(this.data.vendor!.id, payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false),
    });
  }
}
