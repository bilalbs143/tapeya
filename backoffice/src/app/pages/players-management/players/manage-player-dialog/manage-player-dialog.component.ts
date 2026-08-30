import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import { Country, LocationService } from 'src/app/services/location.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import type { CreatePlayerPayload, UpdatePlayerPayload } from 'src/app/services/players.service';
import { PlayersService } from 'src/app/services/players.service';
import type { User } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { AvatarUploaderComponent } from 'src/app/shared/components/avatar-uploader/avatar-uploader.component';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManagePlayerDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

export type ManagePlayerDialogResult = User | undefined;

@Component({
  selector: 'app-manage-player-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, TablerIconsModule, AvatarUploaderComponent],
  templateUrl: './manage-player-dialog.component.html',
})
export class ManagePlayerDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManagePlayerDialogData>(MAT_DIALOG_DATA);
  private readonly playersService = inject(PlayersService);
  private readonly mediaService = inject(MediaService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject<MatDialogRef<ManagePlayerDialogComponent, ManagePlayerDialogResult>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];

  public readonly playingRoleOptions$ = this.enumsService.getOptions('playing_role');
  public readonly bowlingStyleOptions$ = this.enumsService.getOptions('bowling_style');
  public readonly battingStyleOptions$ = this.enumsService.getOptions('batting_style');

  /** Tracks the cropped file chosen in the avatar uploader (null = remove). */
  public pendingAvatarFile: File | null | undefined = undefined;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Player' : 'Add Player';
  }

  public get currentAvatarUrl(): string | null | undefined {
    return this.data.user?.avatar_url;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
    this.sub.add(this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName)));
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public onAvatarChange(file: File | null): void {
    // undefined = no change, File = new upload, null = remove
    this.pendingAvatarFile = file ?? null;
  }

  private initializeForm(): void {
    const u = this.data.user;
    this.form = this.fb.group({
      name: [u?.name ?? '', [Validators.required]],
      nickname: [u?.nickname ?? '', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: [u?.email ?? ''],
      phone: [u?.phone ?? '', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      date_of_birth: [u?.date_of_birth ?? null],
      playing_role: [normalizeEnumValue(u?.playing_role_enum ?? undefined, '')],
      bowling_style: [normalizeEnumValue(u?.bowling_style_enum ?? undefined, '')],
      batting_style: [normalizeEnumValue(u?.batting_style_enum ?? undefined, '')],
      country: [u?.country ?? ''],
      city: [{ value: u?.city ?? '', disabled: !u?.country }],
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
      if (clearCity) {
        cityControl?.setValue('');
      }
      cityControl?.disable();
      return;
    }

    const country = this.countriesList.find((c) => c.name === countryName);
    const code = country?.country_code;
    if (!code) {
      this.cities = [];
      if (clearCity) {
        cityControl?.setValue('');
      }
      cityControl?.disable();
      return;
    }

    if (clearCity) {
      cityControl?.setValue('');
    }
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

    req$
      .pipe(
        switchMap((res) =>
          this.mediaService.applyAvatarField('user', res.data.id, 'avatar', this.pendingAvatarFile, !!this.currentAvatarUrl).pipe(
            catchError(() => {
              this.messageService.error('Player saved, but the avatar could not be updated.');
              return of(undefined);
            }),
            map(() => res)
          )
        ),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (res) => this.dialogRef.close(res.data),
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
