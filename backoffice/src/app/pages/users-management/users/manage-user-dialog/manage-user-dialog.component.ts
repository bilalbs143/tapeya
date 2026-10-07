import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import { Country, LocationService } from 'src/app/services/location.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { CreateUserPayload, UpdateUserPayload, User, UsersService } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { AvatarUploaderComponent } from 'src/app/shared/components/avatar-uploader/avatar-uploader.component';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManageUserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

export type ManageUserDialogResult = User | undefined;

/** Modal to create or edit a backoffice account (Administrator or Operator). */
@Component({
  selector: 'app-manage-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, TablerIconsModule, AvatarUploaderComponent],
  templateUrl: './manage-user-dialog.component.html',
})
export class ManageUserDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageUserDialogData>(MAT_DIALOG_DATA);
  private readonly usersService = inject(UsersService);
  private readonly mediaService = inject(MediaService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject<MatDialogRef<ManageUserDialogComponent, ManageUserDialogResult>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];
  private readonly sub = new Subscription();

  public readonly statusOptions$ = this.enumsService.getOptions('user_status');
  public readonly adminRolesOptions$ = this.enumsService.getOptions('admin_roles');

  /**
   * Maps to API `UserTypeEnum` values. UI labels match how backoffice access works:
   * Administrator = full access by type; Operator = `user` + admin-guard role(s).
   */
  public readonly typeOptions = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'user', label: 'Operator' },
  ] as const;

  public readonly broadcastOptions = [
    { value: false, label: 'Not Allowed' },
    { value: true, label: 'Allowed (Go Live)' },
  ] as const;

  public readonly officialOptions = [
    { value: false, label: 'Not Official' },
    { value: true, label: 'Official (Blue Tick)' },
  ] as const;

  public pendingAvatarFile: File | null | undefined = undefined;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Backoffice User' : 'Create Backoffice User';
  }

  public get currentAvatarUrl(): string | null | undefined {
    return this.data.user?.avatar_url;
  }

  /** API `type=user` — limited backoffice access via operator roles. */
  public get isOperatorType(): boolean {
    return this.form?.get('type')?.value === 'user';
  }

  public get isAdministratorType(): boolean {
    return this.form?.get('type')?.value === 'administrator';
  }

  public onAvatarChange(file: File | null): void {
    this.pendingAvatarFile = file ?? null;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
    this.sub.add(this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName)));
    this.sub.add(this.form.get('type')?.valueChanges.subscribe((type) => this.applyTypeValidators(type)));
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private applyTypeValidators(type: string): void {
    const rolesControl = this.form.get('admin_role_ids');
    const passwordControl = this.form.get('password');

    if (type === 'user') {
      rolesControl?.setValidators([Validators.required]);
    } else {
      rolesControl?.clearValidators();
      rolesControl?.setValue([], { emitEvent: false });
    }
    rolesControl?.updateValueAndValidity({ emitEvent: false });

    if (type === 'administrator' && this.data.mode === 'create') {
      passwordControl?.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      passwordControl?.clearValidators();
    }
    passwordControl?.updateValueAndValidity({ emitEvent: false });
  }

  private initializeForm(): void {
    const user = this.data.user;

    const adminRoleIds = user?.admin_role_ids?.length ? user.admin_role_ids : (user?.admin_roles?.map((r) => r.id) ?? []);
    const type = normalizeEnumValue(user?.type_enum ?? user?.type, 'user');

    this.form = this.fb.group({
      id: [user?.id ?? null],
      name: [user?.name ?? '', [Validators.required]],
      nickname: [
        user?.nickname ?? '',
        [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/)],
      ],
      email: [user?.email ?? ''],
      phone: [user?.phone ?? '', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      date_of_birth: [user?.date_of_birth ?? null],
      type: [type, [Validators.required]],
      status: [normalizeEnumValue(user?.status_enum, 'active'), [Validators.required]],
      admin_role_ids: [adminRoleIds, type === 'user' ? [Validators.required] : []],
      country: [user?.country ?? ''],
      city: [{ value: user?.city ?? '', disabled: !user?.country }],
      can_broadcast: [user?.can_broadcast ?? false],
      is_official: [user?.is_official ?? false],
      password: [
        '',
        type === 'administrator' && this.data.mode === 'create' ? [Validators.required, Validators.minLength(8)] : [],
      ],
      password_confirmation: [''],
    });
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

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.usersService.create(payload as unknown as CreateUserPayload)
        : this.usersService.update(this.data.user!.id, payload as unknown as UpdateUserPayload);

    request$
      .pipe(
        switchMap((res) =>
          this.mediaService.applyAvatarField('user', res.data.id, 'avatar', this.pendingAvatarFile, !!this.currentAvatarUrl).pipe(
            catchError(() => {
              this.messageService.error('User saved, but the avatar could not be updated.');
              return of(undefined);
            }),
            map(() => res)
          )
        ),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (res) => this.dialogRef.close(res.data),
        error: () => {
          // Errors are handled globally by the error interceptor (422 validation toasts, etc.).
        },
      });
  }

  private buildPayload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const isOperator = raw.type === 'user';
    const payload: Record<string, unknown> = {
      name: raw.name,
      nickname: raw.nickname || null,
      email: raw.email || null,
      phone: raw.phone || null,
      date_of_birth: raw.date_of_birth || null,
      type: raw.type,
      status: raw.status,
      // Administrators access backoffice by type; operators need admin-guard role ids.
      admin_role_ids: isOperator && Array.isArray(raw.admin_role_ids) ? raw.admin_role_ids : [],
      country: raw.country || null,
      city: raw.city || null,
      can_broadcast: !!raw.can_broadcast,
      is_official: !!raw.is_official,
    };
    if (raw.password) {
      payload['password'] = raw.password;
      payload['password_confirmation'] = raw.password_confirmation;
    }
    return payload;
  }
}
