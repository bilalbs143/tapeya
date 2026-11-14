import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import {
  type CreateInterestCampaignPayload,
  type InterestCampaign,
  InterestCampaignService,
} from 'src/app/services/interest-campaign.service';
import { MediaService } from 'src/app/services/media.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import {
  DEFAULT_INTEREST_FORM_FIELDS,
  LOCKED_INTEREST_FORM_FIELDS,
  type InterestCustomField,
  type InterestCustomFieldType,
  type InterestFormFieldKey,
} from 'src/app/shared/constants/interest-form-field.constants';
import { CAMPAIGN_LOGO_ASPECT } from 'src/app/shared/constants/thumbnail.constants';

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

function cloneCustomFields(fields: InterestCustomField[]): InterestCustomField[] {
  return fields.map((f) => ({
    ...f,
    options: f.options ? [...f.options] : undefined,
  }));
}

@Component({
  selector: 'app-manage-campaign-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
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
  public readonly logoAspect = CAMPAIGN_LOGO_ASPECT;
  public tournamentOptions: TournamentPickerRow[] = [];
  public tournamentSearch$ = new Subject<string>();
  public slugDirty = false;
  public customFields: InterestCustomField[] = [];
  public customFieldError: string | null = null;
  public readonly optionChipSeparatorKeys = [ENTER, COMMA] as const;

  public readonly statusOptions$ = this.enumsService.getOptions('tournament_interest_campaign_status');
  public readonly formFieldOptions$ = this.enumsService.getOptions('tournament_interest_form_field');
  public readonly customFieldTypeOptions$ = this.enumsService.getOptions('tournament_interest_custom_field_type');

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
      form_fields: [
        c?.form_fields?.length ? [...c.form_fields] : [...DEFAULT_INTEREST_FORM_FIELDS],
        [Validators.required, Validators.minLength(1)],
      ],
      status: [c?.status ?? 'open', [Validators.required]],
      logo: [c?.logo_url ? ({ files: [], existingUrls: [c.logo_url] } as FileUploadValue) : null],
    });

    this.customFields = cloneCustomFields(
      (c?.custom_fields ?? [])
        .filter((f) => f.id !== 'id_document' && f.label?.trim().toLowerCase() !== 'cnic / b-form')
        .map((f) => f)
    );

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

  public addCustomField(type: InterestCustomFieldType = 'text'): void {
    const label = type === 'select' ? 'Trial Venue' : type === 'file' ? 'Document Upload' : 'Custom Question';
    this.customFields = [
      ...this.customFields,
      {
        type,
        label,
        required: true,
        ...(type === 'select' ? { options: [] } : {}),
      },
    ];
    this.markCustomFieldsChanged();
  }

  public removeCustomField(index: number): void {
    this.customFields = this.customFields.filter((_, i) => i !== index);
    this.markCustomFieldsChanged();
  }

  public moveCustomField(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.customFields.length) return;
    const next = [...this.customFields];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    this.customFields = next;
    this.form.markAsDirty();
  }

  public onCustomLabelChange(index: number, label: string): void {
    // Server derives/keeps the storage key from label + previous campaign fields.
    this.patchCustomField(index, { label });
  }

  public onCustomTypeChange(index: number, type: InterestCustomFieldType): void {
    this.patchCustomField(index, {
      type,
      options: type === 'select' ? [...(this.customFields[index].options ?? [])] : undefined,
    });
    this.customFieldError = null;
  }

  public onCustomRequiredChange(index: number, required: boolean): void {
    this.patchCustomField(index, { required });
  }

  public addCustomOption(index: number, event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();
    event.chipInput?.clear();
    if (!value) return;
    const options = [...(this.customFields[index].options ?? [])];
    if (options.some((opt) => opt.toLowerCase() === value.toLowerCase())) return;
    this.patchCustomField(index, { options: [...options, value] });
    this.customFieldError = null;
  }

  public removeCustomOption(index: number, option: string): void {
    this.patchCustomField(index, {
      options: (this.customFields[index].options ?? []).filter((opt) => opt !== option),
    });
  }

  private patchCustomField(index: number, patch: Partial<InterestCustomField>): void {
    this.customFields = this.customFields.map((field, i) => (i === index ? { ...field, ...patch } : field));
    this.form.markAsDirty();
  }

  private markCustomFieldsChanged(): void {
    this.customFieldError = null;
    this.form.markAsDirty();
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

  private validateCustomFields(): boolean {
    for (const field of this.customFields) {
      if (!field.label.trim()) {
        this.customFieldError = 'Each custom field needs a label.';
        return false;
      }
      if (field.type === 'select' && !field.options?.length) {
        this.customFieldError = `Add options for “${field.label.trim()}”.`;
        return false;
      }
    }
    this.customFieldError = null;
    return true;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.validateCustomFields()) {
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
        error: () => undefined,
      });
  }

  private buildPayload(): CreateInterestCampaignPayload {
    const v = this.form.getRawValue();
    const isLinked = v.kind === 'linked';
    const slug = (v.slug ?? '').trim();
    const description = (v.description ?? '').trim();

    const formFields = this.normalizeFormFields(
      Array.from(new Set([...LOCKED_INTEREST_FORM_FIELDS, ...(v.form_fields ?? DEFAULT_INTEREST_FORM_FIELDS)]))
    );

    const payload: CreateInterestCampaignPayload = {
      tournament_id: isLinked ? (v.tournament?.id ?? null) : null,
      status: v.status ?? 'open',
      description: description ? description : null,
      show_in_sidebar: !!v.show_in_sidebar,
      show_dialog: !!v.show_dialog,
      form_fields: formFields,
      custom_fields: this.customFields.map((f) => ({
        type: f.type,
        label: f.label.trim(),
        required: !!f.required,
        ...(f.type === 'select' ? { options: [...(f.options ?? [])] } : {}),
      })),
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
