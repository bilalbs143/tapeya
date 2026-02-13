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
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import { Country, LocationService } from 'src/app/services/location.service';
import { CreateUserPayload, UpdateUserPayload, User, UsersService } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManageUserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

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
  ],
  templateUrl: './manage-user-dialog.component.html',
})
export class ManageUserDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageUserDialogData>(MAT_DIALOG_DATA);
  private readonly usersService = inject(UsersService);
  private readonly enumsService = inject(EnumsService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject<MatDialogRef<ManageUserDialogComponent>>(MatDialogRef);
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

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit User' : 'Create User';
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
    this.sub.add(
      this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName))
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initializeForm(): void {
    const user = this.data.user;
    this.form = this.fb.group({
      id: [user?.id ?? null],
      name: [user?.name ?? '', [Validators.required]],
      email: [user?.email ?? ''],
      phone: [user?.phone ?? '', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      date_of_birth: [user?.date_of_birth ?? null],
      status: [normalizeEnumValue(user?.status_enum, 'verification_pending'), [Validators.required]],
      role_ids: [
        user?.role_ids ?? [],
        [
          Validators.required,
          (c: AbstractControl) => (Array.isArray(c.value) && c.value.length >= 1 ? null : { atLeastOneRole: true }),
        ],
      ],
      playing_role: [normalizeEnumValue(user?.playing_role_enum ?? undefined, '')],
      bowling_style: [normalizeEnumValue(user?.bowling_style_enum ?? undefined, '')],
      batting_style: [normalizeEnumValue(user?.batting_style_enum ?? undefined, '')],
      country: [user?.country ?? ''],
      city: [user?.city ?? ''],
      password: [''],
      password_confirmation: [''],
    });
  }

  private loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (res) => {
        this.countriesList = res.data ?? [];
        const countryName = this.form.get('country')?.value;
        if (countryName) this.loadCitiesForCountry(countryName);
      },
      error: () => (this.countriesList = []),
    });
  }

  private loadCitiesForCountry(countryName: string | null): void {
    if (!countryName) {
      this.cities = [];
      this.form.patchValue({ city: '' });
      return;
    }
    const country = this.countriesList.find((c) => c.name === countryName);
    const code = country?.country_code;
    if (!code) {
      this.cities = [];
      this.form.patchValue({ city: '' });
      return;
    }
    this.locationService.getCities(code).subscribe({
      next: (res) => (this.cities = res.data ?? []),
      error: () => (this.cities = []),
    });
    this.form.patchValue({ city: '' });
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

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.log('Manage user dialog request failed', err);
      },
    });
  }

  private buildPayload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      name: raw.name,
      email: raw.email || null,
      phone: raw.phone || null,
      date_of_birth: raw.date_of_birth || null,
      type: 'user',
      status: raw.status,
      role_ids: Array.isArray(raw.role_ids) ? raw.role_ids : [],
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
