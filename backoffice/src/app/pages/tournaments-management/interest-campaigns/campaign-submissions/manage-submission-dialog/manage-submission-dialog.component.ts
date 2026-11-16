import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import type { InterestCampaign } from 'src/app/services/interest-campaign.service';
import {
  type InterestSubmission,
  type UpdateInterestSubmissionPayload,
  InterestSubmissionService,
} from 'src/app/services/interest-submission.service';
import { Country, LocationService } from 'src/app/services/location.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { AvatarUploaderComponent } from 'src/app/shared/components/avatar-uploader/avatar-uploader.component';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import {
  DEFAULT_INTEREST_FORM_FIELDS,
  type InterestCustomField,
  type InterestFormFieldKey,
} from 'src/app/shared/constants/interest-form-field.constants';
import { PHONE_PATTERN } from 'src/app/shared/constants/validation.constants';

export interface ManageSubmissionDialogData {
  submission: InterestSubmission;
  /** Campaign from detail shell — used when list row campaign is thin. */
  campaign?: InterestCampaign | null;
}

type CustomFileField = { id: string; label: string; required: boolean };

@Component({
  selector: 'app-manage-submission-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, AvatarUploaderComponent, FileUploadComponent],
  templateUrl: './manage-submission-dialog.component.html',
})
export class ManageSubmissionDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageSubmissionDialogData>(MAT_DIALOG_DATA);
  private readonly submissionService = inject(InterestSubmissionService);
  private readonly mediaService = inject(MediaService);
  private readonly locationService = inject(LocationService);
  private readonly enumsService = inject(EnumsService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject<MatDialogRef<ManageSubmissionDialogComponent, boolean>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public form!: FormGroup;
  public isSubmitting = false;
  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];

  public readonly statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions(
    'tournament_interest_submission_status'
  );

  public formFields: InterestFormFieldKey[] = [...DEFAULT_INTEREST_FORM_FIELDS];
  public scalarCustomFields: (InterestCustomField & { id: string })[] = [];
  public fileCustomFields: CustomFileField[] = [];

  /** undefined = no change, File = upload, null = remove */
  public pendingAvatarFile: File | null | undefined = undefined;
  private originalHasAvatar = false;
  private readonly originalFileHas: Record<string, boolean> = {};

  public get title(): string {
    const name = this.data.submission.name?.trim();
    return name ? `Edit Submission — ${name}` : 'Edit Interest Submission';
  }

  public get currentAvatarUrl(): string | null | undefined {
    return this.data.submission.profile_picture_url;
  }

  public ngOnInit(): void {
    this.resolveCampaignFields();
    this.initializeForm();
    this.loadCountries();
    this.sub.add(
      this.form.get('country')!.valueChanges.subscribe((countryName: string | null) => {
        this.loadCitiesForCountry(countryName);
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public fieldEnabled(field: InterestFormFieldKey): boolean {
    return this.formFields.includes(field);
  }

  public onAvatarChange(file: File | null): void {
    this.pendingAvatarFile = file ?? null;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const submissionId = this.data.submission.id;
    this.isSubmitting = true;
    this.submissionService
      .update(submissionId, this.buildPayload())
      .pipe(
        switchMap(() => this.applyMedia(submissionId)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => undefined,
      });
  }

  private resolveCampaignFields(): void {
    const campaign = this.data.campaign ?? this.data.submission.campaign ?? null;
    const fields = campaign?.form_fields;
    this.formFields = fields && fields.length > 0 ? ([...fields] as InterestFormFieldKey[]) : [...DEFAULT_INTEREST_FORM_FIELDS];
    if (!this.formFields.includes('name')) {
      this.formFields = ['name', ...this.formFields];
    }

    this.scalarCustomFields = [];
    this.fileCustomFields = [];

    if (this.fieldEnabled('id_document')) {
      this.fileCustomFields.push({ id: 'id_document', label: 'CNIC / B-Form', required: true });
    }

    for (const field of campaign?.custom_fields ?? []) {
      if (!field.id || field.id === 'id_document') continue;
      if (field.type === 'file') {
        this.fileCustomFields.push({ id: field.id, label: field.label, required: !!field.required });
      } else {
        this.scalarCustomFields.push(field as InterestCustomField & { id: string });
      }
    }
  }

  private initializeForm(): void {
    const s = this.data.submission;
    this.originalHasAvatar = !!s.profile_picture_url;

    const customAnswers: Record<string, unknown> = {};
    for (const field of this.scalarCustomFields) {
      customAnswers[field.id] = [
        s.custom_answers?.[field.id] ?? '',
        field.required ? [Validators.required, Validators.maxLength(191)] : [Validators.maxLength(191)],
      ];
    }

    const files: Record<string, unknown> = {};
    for (const field of this.fileCustomFields) {
      const url = this.existingFileUrl(s, field.id);
      this.originalFileHas[field.id] = !!url;
      files[field.id] = [
        url ? ({ files: [], existingUrls: [url] } satisfies FileUploadValue) : null,
        field.required && !url ? [Validators.required] : [],
      ];
    }

    this.form = this.fb.group({
      name: [s.name ?? '', [Validators.required, Validators.maxLength(191)]],
      nickname: [s.nickname ?? '', this.validatorsIf('nickname', [Validators.required, Validators.maxLength(191)])],
      email: [s.email ?? '', this.validatorsIf('email', [Validators.required, Validators.email])],
      phone: [s.phone ?? '', this.validatorsIf('phone', [Validators.required, Validators.pattern(PHONE_PATTERN)])],
      date_of_birth: [this.parseDate(s.date_of_birth), this.validatorsIf('date_of_birth', [Validators.required])],
      country: [s.country ?? '', this.validatorsIf('country', [Validators.required])],
      city: [{ value: s.city ?? '', disabled: !s.country }, this.validatorsIf('city', [Validators.required])],
      status: [s.status, [Validators.required]],
      custom_answers: this.fb.group(customAnswers),
      files: this.fb.group(files),
    });
  }

  private validatorsIf(field: InterestFormFieldKey, validators: ValidatorFn[]): ValidatorFn[] {
    return this.fieldEnabled(field) ? validators : [];
  }

  private existingFileUrl(
    submission: { id_document_url?: string | null; custom_answers?: Record<string, string | null> | null },
    fieldId: string
  ): string | null {
    if (fieldId === 'id_document') {
      return submission.id_document_url?.trim() || submission.custom_answers?.['id_document']?.trim() || null;
    }
    return submission.custom_answers?.[fieldId]?.trim() || null;
  }

  private loadCountries(): void {
    this.sub.add(
      this.locationService.getCountries().subscribe({
        next: (res) => {
          this.countriesList = res.data ?? [];
          const countryName = this.form.get('country')?.value as string | null;
          if (countryName) {
            this.loadCitiesForCountry(countryName, false);
          }
        },
        error: () => (this.countriesList = []),
      })
    );
  }

  private loadCitiesForCountry(countryName: string | null, clearCity = true): void {
    const cityControl = this.form.get('city');

    if (!countryName) {
      this.cities = [];
      if (clearCity) cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    const code = this.countriesList.find((c) => c.name === countryName)?.country_code;
    if (!code) {
      this.cities = [];
      if (clearCity) cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    if (clearCity) cityControl?.setValue('');

    this.sub.add(
      this.locationService.getCities(code).subscribe({
        next: (res) => {
          this.cities = res.data ?? [];
          cityControl?.enable();
        },
        error: () => {
          this.cities = [];
          cityControl?.disable();
        },
      })
    );
  }

  private buildPayload(): UpdateInterestSubmissionPayload {
    const raw = this.form.getRawValue() as {
      name: string;
      nickname: string;
      email: string;
      phone: string;
      date_of_birth: Date | string | null;
      country: string;
      city: string;
      status: UpdateInterestSubmissionPayload['status'];
      custom_answers: Record<string, string>;
    };

    const payload: UpdateInterestSubmissionPayload = {
      name: String(raw.name ?? '').trim(),
      status: raw.status,
    };

    if (this.fieldEnabled('nickname')) payload.nickname = String(raw.nickname ?? '').trim() || null;
    if (this.fieldEnabled('email')) payload.email = String(raw.email ?? '').trim() || null;
    if (this.fieldEnabled('phone')) payload.phone = String(raw.phone ?? '').trim() || null;
    if (this.fieldEnabled('date_of_birth')) payload.date_of_birth = this.formatDateForApi(raw.date_of_birth);
    if (this.fieldEnabled('country')) payload.country = String(raw.country ?? '').trim() || null;
    if (this.fieldEnabled('city')) payload.city = String(raw.city ?? '').trim() || null;

    if (this.scalarCustomFields.length > 0) {
      const customAnswers: Record<string, string | null> = {};
      for (const field of this.scalarCustomFields) {
        customAnswers[field.id] = String(raw.custom_answers?.[field.id] ?? '').trim() || null;
      }
      payload.custom_answers = customAnswers;
    }

    return payload;
  }

  private applyMedia(submissionId: number) {
    const jobs = [];

    if (this.fieldEnabled('profile_picture')) {
      jobs.push(
        this.mediaService
          .applyAvatarField(
            'interest-submission',
            submissionId,
            'profile_picture',
            this.pendingAvatarFile,
            this.originalHasAvatar
          )
          .pipe(
            catchError(() => {
              this.messageService.error('Submission saved, but the profile picture could not be updated.');
              return of(undefined);
            })
          )
      );
    }

    const fileValues = (this.form.getRawValue() as { files: Record<string, FileUploadValue | null> }).files ?? {};
    for (const field of this.fileCustomFields) {
      jobs.push(
        this.mediaService
          .applyField(
            'interest-submission',
            submissionId,
            field.id,
            fileValues[field.id] ?? null,
            !!this.originalFileHas[field.id]
          )
          .pipe(
            catchError(() => {
              this.messageService.error(`Submission saved, but “${field.label}” could not be updated.`);
              return of(undefined);
            })
          )
      );
    }

    if (jobs.length === 0) return of(undefined);
    return forkJoin(jobs).pipe(map(() => undefined));
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private formatDateForApi(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
