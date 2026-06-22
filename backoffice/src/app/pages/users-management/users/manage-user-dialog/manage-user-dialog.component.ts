import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import { Country, LocationService } from 'src/app/services/location.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { CreateUserPayload, UpdateUserPayload, User, UsersService } from 'src/app/services/users.service';
import { AvatarUploaderComponent } from 'src/app/shared/components/avatar-uploader/avatar-uploader.component';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManageUserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

export type ManageUserDialogResult = User | undefined;

/** Modal to create or edit a user. Uses global error interceptor for 422 validation toasts. */
@Component({
  selector: 'app-manage-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    TablerIconsModule,
    DialogWrapperComponent,
    MatDivider,
    SubmitButtonComponent,
    AvatarUploaderComponent,
  ],
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
  public readonly playingRoleOptions$ = this.enumsService.getOptions('playing_role');
  public readonly bowlingStyleOptions$ = this.enumsService.getOptions('bowling_style');
  public readonly battingStyleOptions$ = this.enumsService.getOptions('batting_style');
  public readonly appRolesOptions$ = this.enumsService.getOptions('app_roles');
  public readonly adminRolesOptions$ = this.enumsService.getOptions('admin_roles');

  public pendingAvatarFile: File | null | undefined = undefined;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit User' : 'Create User';
  }

  public get currentAvatarUrl(): string | null | undefined {
    return this.data.user?.avatar_url;
  }

  public onAvatarChange(file: File | null): void {
    this.pendingAvatarFile = file ?? null;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
    this.sub.add(this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName)));
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initializeForm(): void {
    const user = this.data.user;

    // When editing, the API returns full role objects (roles/admin_roles).
    // Fall back to mapping those to IDs if the flat role_ids array is absent.
    const roleIds = user?.role_ids?.length ? user.role_ids : (user?.roles?.map((r) => r.id) ?? []);
    const adminRoleIds = user?.admin_role_ids?.length ? user.admin_role_ids : (user?.admin_roles?.map((r) => r.id) ?? []);

    this.form = this.fb.group({
      id: [user?.id ?? null],
      name: [user?.name ?? '', [Validators.required]],
      nickname: [user?.nickname ?? '', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: [user?.email ?? ''],
      phone: [user?.phone ?? '', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      date_of_birth: [user?.date_of_birth ?? null],
      status: [normalizeEnumValue(user?.status_enum, 'verification_pending'), [Validators.required]],
      role_ids: [
        roleIds,
        [
          Validators.required,
          (c: AbstractControl) => (Array.isArray(c.value) && c.value.length >= 1 ? null : { atLeastOneRole: true }),
        ],
      ],
      admin_role_ids: [adminRoleIds],
      playing_role: [normalizeEnumValue(user?.playing_role_enum ?? undefined, '')],
      bowling_style: [normalizeEnumValue(user?.bowling_style_enum ?? undefined, '')],
      batting_style: [normalizeEnumValue(user?.batting_style_enum ?? undefined, '')],
      country: [user?.country ?? ''],
      // City starts disabled when no country is pre-selected; enabled reactively via loadCitiesForCountry.
      city: [{ value: user?.city ?? '', disabled: !user?.country }],
      password: [''],
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
    const payload: Record<string, unknown> = {
      name: raw.name,
      nickname: raw.nickname || null,
      email: raw.email || null,
      phone: raw.phone || null,
      date_of_birth: raw.date_of_birth || null,
      type: 'user',
      status: raw.status,
      role_ids: Array.isArray(raw.role_ids) ? raw.role_ids : [],
      admin_role_ids: Array.isArray(raw.admin_role_ids) ? raw.admin_role_ids : [],
      playing_role: raw.playing_role || null,
      bowling_style: raw.bowling_style || null,
      batting_style: raw.batting_style || null,
      country: raw.country || null,
      city: raw.city || null,
    };
    if (raw.password) {
      payload['password'] = raw.password;
      payload['password_confirmation'] = raw.password_confirmation;
    }
    return payload;
  }
}
