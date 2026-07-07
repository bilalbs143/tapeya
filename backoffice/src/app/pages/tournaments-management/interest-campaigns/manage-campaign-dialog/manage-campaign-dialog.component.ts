import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import {
  type CreateInterestCampaignPayload,
  type InterestCampaign,
  InterestCampaignService,
} from 'src/app/services/interest-campaign.service';
import { MediaService } from 'src/app/services/media.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import {
  DEFAULT_INTEREST_FORM_FIELDS,
  LOCKED_INTEREST_FORM_FIELDS,
  type InterestFormFieldKey,
} from 'src/app/shared/constants/interest-form-field.constants';

export interface ManageCampaignDialogData {
  mode: 'create' | 'edit';
  campaign?: InterestCampaign;
  lockedTournamentId?: number | null;
  lockedTournamentName?: string | null;
}

interface TournamentPickerRow {
  id: number;
  tournament_name: string;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugRegexValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (v === '') return null;
  return SLUG_REGEX.test(v) ? null : { slug: true };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Component({
  selector: 'app-manage-campaign-dialog',
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
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDivider,
    FileUploadComponent,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-campaign-dialog.component.html',
})
export class ManageCampaignDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageCampaignDialogData>(MAT_DIALOG_DATA);
  private readonly campaignService = inject(InterestCampaignService);
  private readonly mediaService = inject(MediaService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly enumsService = inject(EnumsService);
  private readonly dialogRef = inject<MatDialogRef<ManageCampaignDialogComponent, boolean>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  private readonly originalHasLogo = !!this.data.campaign?.logo_url;

  public form!: FormGroup;
  public isSubmitting = false;
  public tournamentOptions: TournamentPickerRow[] = [];
  public tournamentSearch$ = new Subject<string>();
  public slugDirty = false;

  public readonly statusOptions$ = this.enumsService.getOptions('tournament_interest_campaign_status');
  public readonly formFieldOptions$ = this.enumsService.getOptions('tournament_interest_form_field');

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get title(): string {
    return this.isEdit ? 'Edit Interest Campaign' : 'New Interest Campaign';
  }

  public get isLocked(): boolean {
    return !!this.data.lockedTournamentId;
  }

  public get isLinkedKind(): boolean {
    return this.form?.get('kind')?.value === 'linked';
  }

  constructor() {
    this.initialiseForm();
  }

  public ngOnInit(): void {
    this.setupTournamentSearch();
    this.tournamentSearch$.next('');

    this.sub.add(
      this.form.get('tournament_name')?.valueChanges.subscribe((v) => this.maybeSyncSlug(typeof v === 'string' ? v : ''))
    );
    this.sub.add(
      this.form.get('tournament')?.valueChanges.subscribe((v: TournamentPickerRow | string | null) => {
        if (v && typeof v === 'object' && 'tournament_name' in v) {
          this.maybeSyncSlug(v.tournament_name);
        }
      })
    );
    this.sub.add(this.form.get('slug')?.valueChanges.subscribe(() => (this.slugDirty = true)));
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initialiseForm(): void {
    const c = this.data.campaign;
    const initialKind: 'linked' | 'custom' = this.isLocked || c?.tournament_id != null ? 'linked' : 'custom';
    const initialTournament: TournamentPickerRow | null = this.isLocked
      ? { id: this.data.lockedTournamentId!, tournament_name: this.data.lockedTournamentName ?? '' }
      : c?.tournament
        ? { id: c.tournament.id, tournament_name: c.tournament.tournament_name }
        : c?.tournament_id
          ? { id: c.tournament_id, tournament_name: c.tournament_name }
          : null;

    this.form = this.fb.group({
      kind: [{ value: initialKind, disabled: this.isLocked }, [Validators.required]],
      tournament: [initialTournament],
      tournament_name: [c?.tournament_name ?? '', [Validators.maxLength(191)]],
      slug: [c?.slug ?? '', [Validators.maxLength(191), slugRegexValidator]],
      description: [c?.description ?? '', [Validators.maxLength(5000)]],
      show_in_sidebar: [c?.show_in_sidebar ?? false],
      show_dialog: [c?.show_dialog ?? false],
      form_fields: [c?.form_fields?.length ? [...c.form_fields] : [...DEFAULT_INTEREST_FORM_FIELDS], [Validators.required, Validators.minLength(1)]],
      status: [c?.status ?? 'open', [Validators.required]],
      logo: [c?.logo_url ? ({ files: [], existingUrls: [c.logo_url] } as FileUploadValue) : null],
    });

    this.applyKindRules(initialKind);
    this.sub.add(this.form.get('kind')?.valueChanges.subscribe((k) => this.applyKindRules(k)));

    if (c?.slug) {
      this.slugDirty = true;
    }

    this.ensureLockedFormFields();
    this.ensureCountryCityPairing();
  }

  private applyKindRules(kind: 'linked' | 'custom'): void {
    const tournament = this.form.get('tournament');
    const tournamentName = this.form.get('tournament_name');
    if (kind === 'linked') {
      tournament?.setValidators([Validators.required, this.tournamentObjectValidator]);
      tournamentName?.clearValidators();
      tournamentName?.setValue('');
    } else {
      tournament?.clearValidators();
      tournament?.setValue(null);
      tournamentName?.setValidators([Validators.required, Validators.maxLength(191)]);
    }
    tournament?.updateValueAndValidity({ emitEvent: false });
    tournamentName?.updateValueAndValidity({ emitEvent: false });
  }

  private tournamentObjectValidator(control: AbstractControl): ValidationErrors | null {
    const v = control.value;
    if (v == null || v === '') return { required: true };
    if (typeof v !== 'object' || !('id' in v) || typeof (v as { id: unknown }).id !== 'number') {
      return { required: true };
    }
    return null;
  }

  private setupTournamentSearch(): void {
    this.sub.add(
      this.tournamentSearch$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) =>
            this.tournamentsService.getList({
              ...(term?.trim() ? { 'filter[tournament_name]': term.trim() } : {}),
              per_page: 25,
              sort: '-id',
            })
          )
        )
        .subscribe({
          next: (res) =>
            (this.tournamentOptions = (res.data ?? []).map((t: Tournament) => ({
              id: t.id,
              tournament_name: t.tournament_name,
            }))),
          error: () => (this.tournamentOptions = []),
        })
    );
  }

  public onTournamentInput(value: string): void {
    this.tournamentSearch$.next(value);
  }

  public displayTournament(opt: TournamentPickerRow | null | string): string {
    if (!opt) return '';
    if (typeof opt === 'string') return opt;
    return opt.tournament_name;
  }

  public onTournamentSelected(ev: MatAutocompleteSelectedEvent): void {
    const opt = ev.option.value as TournamentPickerRow;
    this.form.get('tournament')?.setValue(opt);
  }

  public isFormFieldSelected(key: InterestFormFieldKey): boolean {
    const selected = this.form.get('form_fields')?.value as InterestFormFieldKey[] | null;
    return (selected ?? []).includes(key);
  }

  public isFormFieldLocked(key: InterestFormFieldKey): boolean {
    return LOCKED_INTEREST_FORM_FIELDS.includes(key);
  }

  public toggleFormField(key: InterestFormFieldKey, checked: boolean): void {
    if (this.isFormFieldLocked(key) && !checked) {
      return;
    }

    const control = this.form.get('form_fields');
    const current = [...((control?.value as InterestFormFieldKey[] | null) ?? [])];
    let next = checked ? Array.from(new Set([...current, key])) : current.filter((k) => k !== key);

    if (checked && (key === 'city' || key === 'country')) {
      next = Array.from(new Set([...next, 'country', 'city']));
    }
    if (!checked && (key === 'country' || key === 'city')) {
      next = next.filter((k) => k !== 'country' && k !== 'city');
    }

    control?.setValue(next);
    control?.markAsDirty();
    control?.updateValueAndValidity();
    this.ensureLockedFormFields();
    this.ensureCountryCityPairing();
  }

  private ensureCountryCityPairing(): void {
    const control = this.form.get('form_fields');
    const current = [...((control?.value as InterestFormFieldKey[] | null) ?? [])];
    const hasCountry = current.includes('country');
    const hasCity = current.includes('city');

    let next = current;
    if (hasCountry || hasCity) {
      next = Array.from(new Set([...current, 'country', 'city']));
    } else {
      next = current.filter((k) => k !== 'country' && k !== 'city');
    }

    if (next.length !== current.length || next.some((key, i) => key !== current[i])) {
      control?.setValue(next, { emitEvent: false });
    }
  }

  private normalizeFormFields(fields: InterestFormFieldKey[]): InterestFormFieldKey[] {
    const next = Array.from(new Set([...LOCKED_INTEREST_FORM_FIELDS, ...fields]));
    const hasCountry = next.includes('country');
    const hasCity = next.includes('city');

    if (hasCountry || hasCity) {
      return Array.from(new Set([...next, 'country', 'city']));
    }

    return next.filter((k) => k !== 'country' && k !== 'city');
  }

  private ensureLockedFormFields(): void {
    const control = this.form.get('form_fields');
    const current = [...((control?.value as InterestFormFieldKey[] | null) ?? [])];
    const next = Array.from(new Set([...current, ...LOCKED_INTEREST_FORM_FIELDS]));

    if (next.length !== current.length || LOCKED_INTEREST_FORM_FIELDS.some((key) => !current.includes(key))) {
      control?.setValue(next, { emitEvent: false });
    }
  }

  private maybeSyncSlug(title: string): void {
    if (this.slugDirty) return;
    const next = slugify(title ?? '');
    const slug = this.form.get('slug');
    if (slug && slug.value !== next) {
      slug.setValue(next, { emitEvent: false });
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const logoVal = this.form.getRawValue().logo as FileUploadValue | null;

    this.isSubmitting = true;
    const save$ = this.isEdit
      ? this.campaignService.update(this.data.campaign!.id, payload)
      : this.campaignService.create(payload);

    save$
      .pipe(
        switchMap((res) => this.mediaService.applyField('campaign', res.data.id, 'logo', logoVal, this.originalHasLogo)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        // The HTTP error interceptor surfaces 422 / server messages; nothing to do here.
        error: () => undefined,
      });
  }

  /**
   * Only include fields that apply to the chosen kind. For linked campaigns we
   * omit `tournament_name` so the server can snapshot it from the tournament
   * (sending `null` would fail the Update rule `sometimes|required`).
   */
  private buildPayload(): CreateInterestCampaignPayload {
    const v = this.form.getRawValue();
    const isLinked = v.kind === 'linked';
    const slug = (v.slug ?? '').trim();
    const description = (v.description ?? '').trim();

    const payload: CreateInterestCampaignPayload = {
      tournament_id: isLinked ? (v.tournament?.id ?? null) : null,
      status: v.status ?? 'open',
      description: description ? description : null,
      show_in_sidebar: !!v.show_in_sidebar,
      show_dialog: !!v.show_dialog,
      form_fields: this.normalizeFormFields(Array.from(new Set([...LOCKED_INTEREST_FORM_FIELDS, ...(v.form_fields ?? DEFAULT_INTEREST_FORM_FIELDS)]))),
    };

    if (!isLinked) {
      payload.tournament_name = (v.tournament_name ?? '').trim();
    }
    if (slug) {
      payload.slug = slug;
    }

    return payload;
  }
}
