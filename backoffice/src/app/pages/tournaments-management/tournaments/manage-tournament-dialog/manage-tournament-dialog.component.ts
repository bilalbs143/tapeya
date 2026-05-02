import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import { type Country, LocationService } from 'src/app/services/location.service';
import { MessageService } from 'src/app/services/message.service';
import type { TournamentRequest } from 'src/app/services/tournament-request.service';
import type { Tournament } from 'src/app/services/tournaments.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { UsersService, type UserSearchRow } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

function tournamentDateOrderValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('start_date')?.value;
  const end = group.get('end_date')?.value;
  if (!(start instanceof Date) || !(end instanceof Date)) {
    return null;
  }
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return e < s ? { dateOrder: true } : null;
}

/** Require a selected organizer object (autocomplete); free text counts as invalid like {@link Validators.required}. */
function organizerRequiredValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  if (v == null || v === '') {
    return { required: true };
  }
  if (typeof v !== 'object' || !('id' in v) || typeof (v as { id: unknown }).id !== 'number') {
    return { required: true };
  }
  return null;
}

/** Sponsor row from organizer search — same minimal shape as other admin user pickers. */
export type OrganizerOption = UserSearchRow;

export interface ManageTournamentDialogData {
  mode: 'create' | 'edit';
  tournament?: Tournament;
  /** When set, form is pre-filled from this request (create mode), including organizer from request user. */
  fromRequest?: TournamentRequest;
}

@Component({
  selector: 'app-manage-tournament-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    TablerIconsModule,
    DialogWrapperComponent,
    MatDivider,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-tournament-dialog.component.html',
})
export class ManageTournamentDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageTournamentDialogData>(MAT_DIALOG_DATA);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly usersService = inject(UsersService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject<MatDialogRef<ManageTournamentDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly enumsService = inject(EnumsService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];
  public organizerOptions: OrganizerOption[] = [];
  public organizerSearch$ = new Subject<string>();
  public displayImageFile: File | null = null;
  public coverImageFile: File | null = null;
  public displayImagePreview: string | null = null;
  public coverImagePreview: string | null = null;

  public readonly tournamentTypeOptions$ = this.enumsService.getOptions('tournament_type');
  public readonly groupModeOptions$ = this.enumsService.getOptions('group_mode');
  public readonly cricketFormatOptions$ = this.enumsService.getOptions('cricket_format');
  public readonly matchTimingsOptions$ = this.enumsService.getOptions('match_timings');
  public readonly statusOptions$ = this.enumsService.getOptions('status');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Tournament' : 'Add Tournament';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get displayImageUrl(): string | null {
    return this.displayImagePreview ?? this.data.tournament?.display_image ?? null;
  }

  public get coverImageUrl(): string | null {
    return this.coverImagePreview ?? this.data.tournament?.cover_image ?? null;
  }

  public get isGroupWise(): boolean {
    return this.form?.get('group_mode')?.value === 'group_wise';
  }

  constructor() {
    this.initializeForm();
  }

  public ngOnInit(): void {
    this.loadCountries();
    this.setupOrganizerSearch();
    // Load initial organizer options (for create mode dropdown)
    this.organizerSearch$.next('');
    this.sub.add(
      this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName))
    );
  }

  private setupOrganizerSearch(): void {
    const hasDisplayName = (opt: OrganizerOption): boolean => {
      const s = (opt.nickname || opt.name || '').toString().trim();
      return s.length > 0;
    };
    this.sub.add(
      this.organizerSearch$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => this.usersService.adminUserSearch(term))
        )
        .subscribe({
          next: (res) => {
            this.organizerOptions = (res.data ?? []).filter(hasDisplayName);
            // Ensure current organizer (edit mode) is in options (only if they have a display name)
            const org = this.form.get('organizer')?.value as OrganizerOption | null;
            if (org && hasDisplayName(org) && !this.organizerOptions.some((o) => o.id === org.id)) {
              this.organizerOptions = [org, ...this.organizerOptions];
            }
          },
          error: () => (this.organizerOptions = []),
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (res) => {
        this.countriesList = res.data ?? [];
        const countryName = this.form.get('country')?.value;
        if (countryName) this.loadCitiesForCountry(countryName, false);
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
        // Keep city enabled so required validator fires and prevents accidental submission.
        this.cities = [];
        cityControl?.enable();
      },
    });
  }

  private initializeForm(): void {
    const tournament = this.data.tournament;
    const fromRequest = this.data.fromRequest;

    const source = fromRequest ?? tournament;
    const initialOrganizer: OrganizerOption | null =
      tournament?.organizer_id && tournament?.organizer
        ? {
            id: tournament.organizer_id,
            name: tournament.organizer.name,
            nickname: tournament.organizer.nickname ?? null,
            email: tournament.organizer.email ?? null,
            phone: tournament.organizer.phone ?? null,
          }
        : fromRequest?.user_id && fromRequest?.user
          ? {
              id: fromRequest.user.id,
              name: fromRequest.user.name,
              nickname: fromRequest.user.nickname ?? null,
              email: fromRequest.user.email ?? null,
              phone: fromRequest.user.phone ?? null,
            }
          : null;

    const numGroups = source?.number_of_groups ?? 1;
    const groupMode = numGroups > 1 ? 'group_wise' : 'open';
    const numberOfGroups = numGroups > 1 ? numGroups : 2;

    this.form = this.fb.group(
      {
        organizer: [initialOrganizer, [organizerRequiredValidator]],
        tournament_name: [source?.tournament_name ?? '', [Validators.required, Validators.maxLength(255)]],
        tournament_type: [normalizeEnumValue(source?.tournament_type, ''), [Validators.required]],
        cricket_format: [normalizeEnumValue(source?.cricket_format, ''), [Validators.required]],
        venue_name: [source?.venue_name ?? '', [Validators.required, Validators.maxLength(255)]],
        start_date: [source?.start_date ? this.parseDate(String(source.start_date)) : null, [Validators.required]],
        end_date: [source?.end_date ? this.parseDate(String(source.end_date)) : null, [Validators.required]],
        number_of_teams: [
          source?.number_of_teams ?? null,
          [Validators.required, Validators.min(1), Validators.max(500)],
        ],
        group_mode: [groupMode, [Validators.required]],
        number_of_groups: [numberOfGroups, [Validators.min(2), Validators.max(16)]],
        country: [source?.country ?? '', [Validators.required, Validators.maxLength(100)]],
        // City starts disabled until a country is selected; enabled reactively via loadCitiesForCountry.
        city: [{ value: source?.city ?? '', disabled: !source?.country }, [Validators.required, Validators.maxLength(100)]],
        match_timings: [normalizeEnumValue(source?.match_timings, ''), [Validators.required]],
        status: [normalizeEnumValue(tournament?.status_enum ?? tournament?.status, 'active'), [Validators.required]],
        prize: [source?.prize ?? '', [Validators.maxLength(255)]],
      },
      { validators: [tournamentDateOrderValidator] }
    );
  }

  public endDateOrderShowError(): boolean {
    return !!(
      this.form.errors?.['dateOrder'] &&
      (this.form.get('end_date')?.touched || this.form.get('start_date')?.touched)
    );
  }

  public onDisplayImageSelected(ev: unknown): void {
    const input = (ev as { target: HTMLInputElement | null }).target;
    if (!input) return;
    const file = input.files?.[0];
    if (file) {
      this.displayImageFile = file;
      this.displayImagePreview = null;
      const reader = new FileReader();
      reader.onload = () => (this.displayImagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  public clearDisplayImage(): void {
    this.displayImageFile = null;
    this.displayImagePreview = null;
  }

  public onCoverImageSelected(ev: unknown): void {
    const input = (ev as { target: HTMLInputElement | null }).target;
    if (!input) return;
    const file = input.files?.[0];
    if (file) {
      this.coverImageFile = file;
      this.coverImagePreview = null;
      const reader = new FileReader();
      reader.onload = () => (this.coverImagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  public clearCoverImage(): void {
    this.coverImageFile = null;
    this.coverImagePreview = null;
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatDateForApi(value: Date | null): string | null {
    if (!value) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  public onOrganizerSearchInput(value: string): void {
    this.organizerSearch$.next(value || '');
  }

  public onOrganizerSelected(ev: MatAutocompleteSelectedEvent): void {
    const org = ev.option.value as OrganizerOption;
    this.form.patchValue({ organizer: org });
  }

  public organizerDisplayFn(org: OrganizerOption | string | null): string {
    return org && typeof org === 'object' && 'name' in org ? org.nickname || org.name : '';
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Use getRawValue() to include disabled controls (e.g., city while cities are loading).
    const v = this.form.getRawValue();
    const formData = new FormData();
    formData.append('organizer_id', String((v.organizer as OrganizerOption)?.id ?? ''));
    formData.append('tournament_name', v.tournament_name);
    formData.append('tournament_type', v.tournament_type);
    formData.append('cricket_format', v.cricket_format);
    formData.append('venue_name', v.venue_name);
    formData.append('start_date', this.formatDateForApi(v.start_date) ?? '');
    formData.append('end_date', this.formatDateForApi(v.end_date) ?? '');
    formData.append('number_of_teams', String(Number(v.number_of_teams)));
    const numGroups: number = v.group_mode === 'group_wise' ? Number(v.number_of_groups) || 2 : 1;
    formData.append('number_of_groups', String(Math.max(1, Math.min(16, numGroups))));
    formData.append('country', v.country ?? '');
    formData.append('city', v.city);
    formData.append('match_timings', v.match_timings);
    formData.append('status', v.status);
    if (v.prize != null && String(v.prize).trim() !== '') {
      formData.append('prize', String(v.prize).trim());
    }
    if (this.displayImageFile) formData.append('display_image', this.displayImageFile);
    if (this.coverImageFile) formData.append('cover_image', this.coverImageFile);

    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.tournamentsService.create(formData)
        : this.tournamentsService.update(this.data.tournament!.id, formData);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.messageService.error('Failed to save tournament.'),
    });
  }
}
