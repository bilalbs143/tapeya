import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import type { Event } from 'src/app/services/events.service';
import { EventsService } from 'src/app/services/events.service';
import { type Country, LocationService } from 'src/app/services/location.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';
import { normalizeEnumValue } from 'src/app/shared/functions/enum.function';

export interface ManageEventDialogData {
  mode: 'create' | 'edit';
  event?: Event;
}

@Component({
  selector: 'app-manage-event-dialog',
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
  templateUrl: './manage-event-dialog.component.html',
})
export class ManageEventDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageEventDialogData>(MAT_DIALOG_DATA);
  private readonly eventsService = inject(EventsService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject<MatDialogRef<ManageEventDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly enumsService = inject(EnumsService);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];
  public displayImageFile: File | null = null;
  public coverImageFile: File | null = null;
  public displayImagePreview: string | null = null;
  public coverImagePreview: string | null = null;

  public readonly eventTypeOptions$ = this.enumsService.getOptions('event_type');
  public readonly cricketFormatOptions$ = this.enumsService.getOptions('cricket_format');
  public readonly matchTimingsOptions$ = this.enumsService.getOptions('match_timings');
  public readonly statusOptions$ = this.enumsService.getOptions('status');

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Event' : 'Add Event';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get displayImageUrl(): string | null {
    return this.displayImagePreview ?? this.data.event?.display_image ?? null;
  }

  public get coverImageUrl(): string | null {
    return this.coverImagePreview ?? this.data.event?.cover_image ?? null;
  }

  constructor() {
    this.initializeForm();
  }

  public ngOnInit(): void {
    this.loadCountries();
    this.sub.add(
      this.form.get('country')?.valueChanges.subscribe((countryName) => this.loadCitiesForCountry(countryName))
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
    const event = this.data.event;
    this.form = this.fb.group({
      contact_person_name: [event?.contact_person_name ?? '', [Validators.required, Validators.maxLength(255)]],
      contact_phone: [
        event?.contact_phone ?? '',
        [Validators.required, Validators.pattern(PHONE_PATTERN), Validators.maxLength(30)],
      ],
      event_name: [event?.event_name ?? '', [Validators.required, Validators.maxLength(255)]],
      event_type: [normalizeEnumValue(event?.event_type, ''), [Validators.required]],
      cricket_format: [normalizeEnumValue(event?.cricket_format, ''), [Validators.required]],
      venue_name: [event?.venue_name ?? '', [Validators.required, Validators.maxLength(255)]],
      start_date: [event?.start_date ? this.parseDate(event.start_date) : null, [Validators.required]],
      end_date: [event?.end_date ? this.parseDate(event.end_date) : null, [Validators.required]],
      number_of_matches: [
        event?.number_of_matches ?? null,
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      number_of_teams: [
        event?.number_of_teams ?? null,
        [Validators.required, Validators.min(1), Validators.max(500)],
      ],
      expected_players_count: [
        event?.expected_players_count ?? null,
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
      country: [event?.country ?? '', [Validators.required, Validators.maxLength(100)]],
      city: [event?.city ?? '', [Validators.required, Validators.maxLength(100)]],
      match_timings: [normalizeEnumValue(event?.match_timings, ''), [Validators.required]],
      status: [normalizeEnumValue(event?.status_enum ?? event?.status, 'active'), [Validators.required]],
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

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const formData = new FormData();
    formData.append('contact_person_name', v.contact_person_name);
    formData.append('contact_phone', v.contact_phone);
    formData.append('event_name', v.event_name);
    formData.append('event_type', v.event_type);
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
    if (this.displayImageFile) formData.append('display_image', this.displayImageFile);
    if (this.coverImageFile) formData.append('cover_image', this.coverImageFile);

    this.isSubmitting = true;

    const request$ =
      this.data.mode === 'create'
        ? this.eventsService.create(formData)
        : this.eventsService.update(this.data.event!.id, formData);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {},
    });
  }
}
