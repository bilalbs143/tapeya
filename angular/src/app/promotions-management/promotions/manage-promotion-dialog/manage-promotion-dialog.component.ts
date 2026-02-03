import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { finalize } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../../shared/constants/constants';
import { MessageService } from '../../../shared/services/message.service';
import { PromotionsService } from '../../../shared/services/promotions.service';

@Component({
  selector: 'app-manage-promotion-dialog',
  templateUrl: './manage-promotion-dialog.component.html',
  standalone: false,
})
export class ManagePromotionDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<ManagePromotionDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private promotionsService = inject(PromotionsService);
  private messageService = inject(MessageService);

  public form: FormGroup;
  public types: Array<any> = [];
  public configSchema: any[] = [];
  public selectedTypeFormula: string = '';
  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public isSubmitting: boolean = false;
  public selectedFile: File | null = null;
  public newImagePreview: string | ArrayBuffer | null = null;
  public oldImageUrl: string | null = null;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  private readonly typeConfigMap: Record<string, string[]> = {
    slots_deposit: ['min_deposit', 'max_bonus', 'bonus_percentage', 'to_multiplier', 'expiry_after_activation_hours'],
    casino_streak: ['stake_min', 'stake_max', 'streak_length', 'bonus_percentage'],
    slots_cashback_commission: ['cashback_percentage', 'commission_percentage', 'min_payout'],
    sports_cashback_commission: ['cashback_percentage', 'commission_percentage', 'min_payout', 'odds_thresholds_dec'],
    poker_rakeback: ['rakeback_percentage', 'min_payout'],
    arcade_cashback: ['cashback_percentage', 'min_payout', 'max_payout'],
    casino_commission: ['commission_percentage'],
    loss_guarantee: ['min_deposit', 'max_guarantee', 'claim_to_multiplier', 'withdraw_multiplier', 'max_withdrawable', 'allowed_providers'],
    sabung_cashback: ['cashback_percentage', 'min_payout'],
  };

  public ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm();
    this.loadTypes();
    if (this.data?.record?.id) {
      this.patchForm(this.data.record);
    }
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      valid_from: [''],
      valid_to: [''],
      is_stackable: [false],
      is_visible: [true],
      description: [''],
      min_deposit: [''],
      max_bonus: [''],
      to_multiplier: [''],
      expiry_after_activation_hours: [''],
      bonus_percentage: [''],
      cashback_percentage: [''],
      commission_percentage: [''],
      rakeback_percentage: [''],
      min_payout: [''],
      max_payout: [''],
      max_guarantee: [''],
      claim_to_multiplier: [''],
      withdraw_multiplier: [''],
      max_withdrawable: [''],
      allowed_providers: [''],
      stake_min: [''],
      stake_max: [''],
      streak_length: [''],
      odds_thresholds_dec: [''],
      image: ['', this.data?.record?.id ? [] : [Validators.required]],
    });

    this.form.get('type')?.valueChanges.subscribe((type) => {
      this.applyTypeValidators(type);
      this.setSchemaFor(type);
    });
  }

  private patchForm(record: any): void {
    const cfg = record.config || {};
    this.oldImageUrl = record.image || null;
    this.form.patchValue({
      name: record.name,
      type: record.type,
      status: record.status,
      valid_from: record.valid_from,
      valid_to: record.valid_to,
      is_stackable: record.is_stackable,
      is_visible: record.is_visible,
      description: cfg.description || '',
      min_deposit: cfg.min_deposit ?? '',
      max_bonus: cfg.max_bonus ?? '',
      to_multiplier: cfg.to_multiplier ?? '',
      expiry_after_activation_hours: cfg.expiry_after_activation_hours ?? '',
      bonus_percentage: cfg.bonus_percentage ?? '',
      cashback_percentage: cfg.cashback_percentage ?? '',
      commission_percentage: cfg.commission_percentage ?? '',
      rakeback_percentage: cfg.rakeback_percentage ?? '',
      min_payout: cfg.min_payout ?? '',
      max_payout: cfg.max_payout ?? '',
      max_guarantee: cfg.max_guarantee ?? '',
      claim_to_multiplier: cfg.claim_to_multiplier ?? '',
      withdraw_multiplier: cfg.withdraw_multiplier ?? '',
      max_withdrawable: cfg.max_withdrawable ?? '',
      allowed_providers: (cfg.allowed_providers || []).join(','),
      stake_min: cfg.stake_min ?? '',
      stake_max: cfg.stake_max ?? '',
      streak_length: cfg.streak_length ?? '',
      odds_thresholds_dec: cfg.odds_thresholds?.dec ?? '',
      image: '',
    });

    this.applyTypeValidators(record.type);
    this.setSchemaFor(record.type);
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    const request$ = this.data?.record?.id ? this.promotionsService.update(this.data.record.id, payload) : this.promotionsService.create(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message || 'SUCCESS');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Promotion save error:', error);
          this.messageService.snackBar(error?.error?.message || 'ERROR');
        },
      });
  }

  public onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (!file) return;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (): any => (this.newImagePreview = reader.result);
    reader.readAsDataURL(file);
  }

  private buildPayload(): FormData {
    const raw = this.form.value;
    const formData = new FormData();
    const config: Record<string, any> = { description: raw.description };
    const activeFields = this.typeConfigMap[raw.type] || this.configSchema.map((f) => f.name);

    activeFields.forEach((field) => {
      const val = raw[field];
      if (val !== null && val !== '') {
        if (field === 'allowed_providers') {
          config['allowed_providers'] = val
            .split(',')
            .map((p: string) => p.trim())
            .filter((p: string) => !!p);
        } else if (field === 'odds_thresholds_dec') {
          config['odds_thresholds'] = { dec: Number(val) };
        } else {
          config[field] = Number.isNaN(Number(val)) ? val : Number(val);
        }
      }
    });

    formData.append('name', raw.name);
    formData.append('type', raw.type);
    formData.append('status', raw.status);
    if (raw.valid_from) formData.append('valid_from', this.formatDate(raw.valid_from));
    if (raw.valid_to) formData.append('valid_to', this.formatDate(raw.valid_to));
    formData.append('is_stackable', raw.is_stackable ? '1' : '0');
    formData.append('is_visible', raw.is_visible ? '1' : '0');

    Object.entries(config).forEach(([key, value]) => {
      if (key === 'allowed_providers' && Array.isArray(value)) {
        value.forEach((v: string) => formData.append('config[allowed_providers][]', v));
      } else if (key === 'odds_thresholds') {
        const dec = value['dec'];
        if (dec !== undefined && dec !== null) {
          formData.append('config[odds_thresholds][dec]', String(dec));
        }
      } else {
        formData.append(`config[${key}]`, String(value));
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    return formData;
  }

  private formatDate(value: any): string {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  }

  private loadTypes(): void {
    this.promotionsService.types().subscribe({
      next: (response) => {
        const data = response.data || {};
        this.types = Object.values(data);
        if (this.data?.record?.type) {
          this.setSchemaFor(this.data.record.type);
        }
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  private applyTypeValidators(type: string): void {
    const allConfigFields = [...new Set(Object.values(this.typeConfigMap).flat())];
    const activeFields = this.typeConfigMap[type] || this.configSchema.map((f) => f.name);

    allConfigFields.forEach((field) => {
      const control = this.form.get(field);
      if (!control) return;

      if (activeFields.includes(field)) {
        control.setValidators([Validators.required]);
      } else {
        control.clearValidators();
        control.setValue('');
      }
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private setSchemaFor(type: string): void {
    const found = this.types.find((t: any) => t.key === type);
    this.configSchema = found?.config_schema || [];
    this.selectedTypeFormula = found?.formula || '';
  }
}
