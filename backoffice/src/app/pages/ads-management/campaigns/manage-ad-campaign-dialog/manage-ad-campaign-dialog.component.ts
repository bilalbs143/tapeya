import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type {
  AdCampaign,
  AdCampaignSavePayload,
  AdCampaignStatus,
  AdCampaignSurface,
} from 'src/app/services/ad/ad-campaign.service';
import { AdCampaignService } from 'src/app/services/ad/ad-campaign.service';
import type { BrandPartner } from 'src/app/services/ad/brand-partner.service';
import { BrandPartnerService } from 'src/app/services/ad/brand-partner.service';
import { type Country, LocationService } from 'src/app/services/location.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface ManageAdCampaignDialogData {
  mode: 'create' | 'edit';
  campaign?: AdCampaign;
}

const STATUS_OPTIONS: { value: AdCampaignStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'ended', label: 'Ended' },
];

const SURFACE_OPTIONS: { value: AdCampaignSurface; label: string }[] = [
  { value: 'home_feed', label: 'Home Feed' },
  { value: 'reels_feed', label: 'Reels Feed' },
];

const PLATFORM_OPTIONS: { value: string; label: string }[] = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
];

@Component({
  selector: 'app-manage-ad-campaign-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDatepickerModule, CommonSharedModule],
  templateUrl: './manage-ad-campaign-dialog.component.html',
})
export class ManageAdCampaignDialogComponent implements OnInit {
  public readonly data = inject<ManageAdCampaignDialogData>(MAT_DIALOG_DATA);
  private readonly campaignService = inject(AdCampaignService);
  private readonly brandPartnerService = inject(BrandPartnerService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject(MatDialogRef<ManageAdCampaignDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public brandPartners: BrandPartner[] = [];
  public countriesList: Country[] = [];
  public readonly statusOptions = STATUS_OPTIONS;
  public readonly surfaceOptions = SURFACE_OPTIONS;
  public readonly platformOptions = PLATFORM_OPTIONS;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Campaign' : 'Add Campaign';
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadBrandPartners();
    this.loadCountries();
  }

  private initializeForm(): void {
    const c = this.data.campaign;
    const targeting = c?.targeting_json ?? {};
    const countries = (targeting.countries ?? []).map((code) => String(code).trim().toUpperCase()).filter(Boolean);
    const platforms = (targeting.platforms ?? []).map((p) => String(p).trim().toLowerCase()).filter(Boolean);
    this.form = this.fb.group({
      brand_partner_id: [c?.brand_partner_id ?? null, [Validators.required]],
      name: [c?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      status: [c?.status ?? 'draft', [Validators.required]],
      starts_at_date: [this.parseDateTimeToDate(c?.starts_at)],
      starts_at_time: [this.parseDateTimeToTime(c?.starts_at)],
      ends_at_date: [this.parseDateTimeToDate(c?.ends_at)],
      ends_at_time: [this.parseDateTimeToTime(c?.ends_at)],
      priority: [c?.priority ?? 0, [Validators.min(0)]],
      surfaces: [
        c?.surfaces?.length ? [...c.surfaces] : (['home_feed'] as AdCampaignSurface[]),
        [Validators.required, Validators.minLength(1)],
      ],
      slot_every_n: [c?.slot_every_n ?? 8, [Validators.min(3)]],
      max_ads_per_response: [c?.max_ads_per_response ?? 1, [Validators.min(1)]],
      platforms: [platforms],
      countries: [countries],
      budget_notes: [c?.budget_notes ?? ''],
    });
  }

  private loadBrandPartners(): void {
    this.brandPartnerService.getList({ per_page: 100, page: 1, 'filter[status]': 'active' }).subscribe({
      next: (res) => {
        const active = res.data ?? [];
        // Keep current partner visible when editing a non-active partner.
        const currentId = this.data.campaign?.brand_partner_id;
        const current = this.data.campaign?.brand_partner;
        if (currentId && current && !active.some((p) => p.id === currentId)) {
          this.brandPartners = [{ ...current, id: currentId } as BrandPartner, ...active];
        } else {
          this.brandPartners = active;
        }
      },
      error: () => (this.brandPartners = []),
    });
  }

  private loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (res) => (this.countriesList = res.data ?? []),
      error: () => (this.countriesList = []),
    });
  }

  private parseDateTimeToDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private parseDateTimeToTime(value: string | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private toIsoDateTime(date: Date | null, time: string | null): string | null {
    if (!date) return null;
    const [h = '0', m = '0'] = (time || '00:00').split(':');
    const d = new Date(date);
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const countries = ((raw.countries as string[]) ?? []).map((code) => String(code).trim().toUpperCase()).filter(Boolean);
    const platforms = ((raw.platforms as string[]) ?? []).map((p) => String(p).trim().toLowerCase()).filter(Boolean);
    const payload: AdCampaignSavePayload = {
      brand_partner_id: Number(raw.brand_partner_id),
      name: String(raw.name).trim(),
      status: raw.status as AdCampaignStatus,
      starts_at: this.toIsoDateTime(raw.starts_at_date, raw.starts_at_time),
      ends_at: this.toIsoDateTime(raw.ends_at_date, raw.ends_at_time),
      priority: Number(raw.priority ?? 0),
      surfaces: (raw.surfaces ?? []) as AdCampaignSurface[],
      slot_every_n: raw.slot_every_n != null && String(raw.slot_every_n).trim() !== '' ? Number(raw.slot_every_n) : null,
      max_ads_per_response:
        raw.max_ads_per_response != null && String(raw.max_ads_per_response).trim() !== ''
          ? Number(raw.max_ads_per_response)
          : null,
      targeting_json: {
        platforms,
        countries,
      },
      budget_notes: (raw.budget_notes ?? '').trim() || null,
    };

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.campaignService.create(payload)
        : this.campaignService.update(this.data.campaign!.id, payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        // Keep dialog open; HTTP interceptor shows the error toast.
      },
    });
  }
}
