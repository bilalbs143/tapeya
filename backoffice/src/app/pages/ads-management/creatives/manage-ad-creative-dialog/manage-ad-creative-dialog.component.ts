import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { AdCampaign } from 'src/app/services/ad/ad-campaign.service';
import { AdCampaignService } from 'src/app/services/ad/ad-campaign.service';
import type { AdCreative, AdCreativeCtaType, AdCreativeSavePayload } from 'src/app/services/ad/ad-creative.service';
import { AdCreativeService } from 'src/app/services/ad/ad-creative.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface ManageAdCreativeDialogData {
  mode: 'create' | 'edit';
  creative?: AdCreative;
}

const CTA_TYPE_OPTIONS: { value: AdCreativeCtaType; label: string }[] = [
  { value: 'url', label: 'URL' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'deep_link', label: 'Deep Link' },
];

@Component({
  selector: 'app-manage-ad-creative-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './manage-ad-creative-dialog.component.html',
})
export class ManageAdCreativeDialogComponent implements OnInit {
  public readonly data = inject<ManageAdCreativeDialogData>(MAT_DIALOG_DATA);
  private readonly creativeService = inject(AdCreativeService);
  private readonly campaignService = inject(AdCampaignService);
  private readonly dialogRef = inject(MatDialogRef<ManageAdCreativeDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;
  public isSubmitting = false;
  public campaigns: AdCampaign[] = [];
  public readonly ctaTypeOptions = CTA_TYPE_OPTIONS;

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit Creative' : 'Add Creative';
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadCampaigns();
  }

  private initializeForm(): void {
    const c = this.data.creative;
    this.form = this.fb.group({
      campaign_id: [c?.campaign_id ?? null, [Validators.required]],
      post_id: [c?.post_id ?? null, [Validators.required, Validators.min(1)]],
      name: [c?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      headline: [c?.headline ?? ''],
      cta_label: [c?.cta_label ?? '', [Validators.required, Validators.maxLength(64)]],
      cta_url: [c?.cta_url ?? '', [Validators.required]],
      cta_type: [c?.cta_type ?? 'url', [Validators.required]],
      disclosure_label: [c?.disclosure_label ?? 'Sponsored'],
    });
  }

  private loadCampaigns(): void {
    this.campaignService.getList({ per_page: 100, page: 1 }).subscribe({
      next: (res) => (this.campaigns = res.data ?? []),
      error: () => (this.campaigns = []),
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: AdCreativeSavePayload = {
      campaign_id: Number(raw.campaign_id),
      post_id: Number(raw.post_id),
      name: String(raw.name).trim(),
      headline: String(raw.headline ?? '').trim() || null,
      cta_label: String(raw.cta_label).trim(),
      cta_url: String(raw.cta_url).trim(),
      cta_type: raw.cta_type as AdCreativeCtaType,
      disclosure_label: (raw.disclosure_label ?? '').trim() || 'Sponsored',
    };

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create'
        ? this.creativeService.create(payload)
        : this.creativeService.update(this.data.creative!.id, payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        // Keep dialog open; HTTP interceptor shows the error toast.
      },
    });
  }
}
