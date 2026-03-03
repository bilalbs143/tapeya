import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import { type Country, LocationService } from 'src/app/services/location.service';
import { MessageService } from 'src/app/services/message.service';
import type { Tournament } from 'src/app/services/tournaments.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { UsersService } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface OrganizerOption {
  id: number;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
}

export interface ManageTournamentDialogData {
  mode: 'create' | 'edit';
  tournament?: Tournament;
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
          switchMap((term) => this.usersService.searchUsersForOrganizerDropdown(term))
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
    if (!countryName) {
      this.cities = [];
      if (clearCity) this.form.patchValue({ city: '' });
      return;
    }
    const country = this.countriesList.find((c) => c.name === countryName);
    const code = country?.country_code;
    if (!code) {
      this.cities = [];
      if (clearCity) this.form.patchValue({ city: '' });
      return;
    }
    this.locationService.getCities(code).subscribe({
      next: (res) => (this.cities = res.data ?? []),
      error: () => (this.cities = []),
    });
    if (clearCity) this.form.patchValue({ city: '' });
  }

  private initializeForm(): void {
    const tournament = this.data.tournament;
    const initialOrganizer: OrganizerOption | null =
      tournament?.organizer_id && tournament?.organizer
        ? {
            id: tournament.organizer_id,
            name: tournament.organizer.name,
            nickname: tournament.organizer.nickname ?? null,
            email: tournament.organizer.email ?? null,
            phone: tournament.organizer.phone ?? null,
          }
        : null;
    this.form = this.fb.group({
      organizer: [
        initialOrganizer,
        [
          Validators.required,
          (c: AbstractControl) => {
            const v = c.value;
            if (!v || typeof v !== 'object' || !('id' in v)) return { organizerRequired: true };
            return null;
          },
        ],
      ],
      tournament_name: [tournament?.tournament_name ?? '', [Validators.required, Validators.maxLength(255)]],
      tournament_type: [normalizeEnumValue(tournament?.tournament_type, ''), [Validators.required]],
      cricket_format: [normalizeEnumValue(tournament?.cricket_format, ''), [Validators.required]],
      venue_name: [tournament?.venue_name ?? '', [Validators.required, Validators.maxLength(255)]],
      start_date: [tournament?.start_date ? this.parseDate(tournament.start_date) : null, [Validators.required]],
      end_date: [tournament?.end_date ? this.parseDate(tournament.end_date) : null, [Validators.required]],
      number_of_matches: [
        tournament?.number_of_matches ?? null,
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      number_of_teams: [
        tournament?.number_of_teams ?? null,
        [Validators.required, Validators.min(1), Validators.max(500)],
      ],
      expected_players_count: [
        tournament?.expected_players_count ?? null,
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
      country: [tournament?.country ?? '', [Validators.required, Validators.maxLength(100)]],
      city: [tournament?.city ?? '', [Validators.required, Validators.maxLength(100)]],
      match_timings: [normalizeEnumValue(tournament?.match_timings, ''), [Validators.required]],
      status: [normalizeEnumValue(tournament?.status_enum ?? tournament?.status, 'active'), [Validators.required]],
      prize: [tournament?.prize ?? '', [Validators.maxLength(255)]],
    });
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

    const v = this.form.value;
    const formData = new FormData();
    formData.append('organizer_id', String((v.organizer as OrganizerOption)?.id ?? ''));
    formData.append('tournament_name', v.tournament_name);
    formData.append('tournament_type', v.tournament_type);
    formData.append('cricket_format', v.cricket_format);
    formData.append('venue_name', v.venue_name);
    formData.append('start_date', this.formatDateForApi(v.start_date) ?? '');
    formData.append('end_date', this.formatDateForApi(v.end_date) ?? '');
    formData.append('number_of_matches', String(Number(v.number_of_matches)));
    formData.append('number_of_teams', String(Number(v.number_of_teams)));
    formData.append('expected_players_count', String(Number(v.expected_players_count)));
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
