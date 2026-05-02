import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import type { CreatePlayerPayload, UpdatePlayerPayload } from 'src/app/services/players.service';
import { PlayersService } from 'src/app/services/players.service';
import type { User } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManagePlayerDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-manage-player-dialog',
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
  templateUrl: './manage-player-dialog.component.html',
})
export class ManagePlayerDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManagePlayerDialogData>(MAT_DIALOG_DATA);
  private readonly playersService = inject(PlayersService);
  private readonly enumsService = inject(EnumsService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject<MatDialogRef<ManagePlayerDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];

  public readonly playingRoleOptions$ = this.enumsService.getOptions('playing_role');
  public readonly bowlingStyleOptions$ = this.enumsService.getOptions('bowling_style');
  public readonly battingStyleOptions$ = this.enumsService.getOptions('batting_style');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Player' : 'Add Player';
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
    const u = this.data.user;
    this.form = this.fb.group({
      name: [u?.name ?? '', [Validators.required]],
      nickname: [
        u?.nickname ?? '',
        [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      ],
      email: [u?.email ?? ''],
      phone: [u?.phone ?? '', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      date_of_birth: [u?.date_of_birth ?? null],
      playing_role: [normalizeEnumValue(u?.playing_role_enum ?? undefined, '')],
      bowling_style: [normalizeEnumValue(u?.bowling_style_enum ?? undefined, '')],
      batting_style: [normalizeEnumValue(u?.batting_style_enum ?? undefined, '')],
      country: [u?.country ?? ''],
      // City starts disabled until a country is selected; enabled reactively via loadCitiesForCountry.
      city: [{ value: u?.city ?? '', disabled: !u?.country }],
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
    const cityControl = this.form.get('city');

    if (!countryName) {
      this.cities = [];
      cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    const country = this.countriesList.find((c) => c.name === countryName);
    const code = country?.country_code;
    if (!code) {
      this.cities = [];
      cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    cityControl?.setValue('');
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
    const req$ =
      this.data.mode === 'create'
        ? this.playersService.create(payload as CreatePlayerPayload)
        : this.playersService.update(this.data.user!.id, payload as UpdatePlayerPayload);

    req$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => undefined,
    });
  }

  private buildPayload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    return {
      name: raw.name,
      nickname: raw.nickname,
      email: raw.email || null,
      phone: raw.phone,
      date_of_birth: raw.date_of_birth || null,
      playing_role: raw.playing_role || null,
      bowling_style: raw.bowling_style || null,
      batting_style: raw.batting_style || null,
      country: raw.country || null,
      city: raw.city || null,
    };
  }
}
