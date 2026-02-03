import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { BANK_ACCOUNT_TYPES } from '../../../shared/constants/constants';
import { BankAccountsService } from '../../../shared/services/bank-accounts.service';
import { BanksService } from '../../../shared/services/banks.service';
import { MessageService } from '../../../shared/services/message.service';
import { onlyNumbers, noSpaceAllowed } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './manage-bank-account-dialog.component.html',
  standalone: false,
})
export class ManageBankAccountDialogComponent implements OnInit {
  public data = inject(MAT_DIALOG_DATA);
  private bankAccountsService = inject(BankAccountsService);
  private banksService = inject(BanksService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageBankAccountDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;
  public banks: Array<any> = [];
  public logoPreview: string | null = null;
  public qrCodePreview: string | null = null;
  private selectedLogo: File | null = null;
  private selectedQrCode: File | null = null;
  protected readonly accountTypes = BANK_ACCOUNT_TYPES;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.loadBanks();
    this.initializeForm();
  }

  private loadBanks(): void {
    const requestParams = new HttpParams().set('all', true);

    this.banksService.get(requestParams).subscribe({
      next: (response) => {
        this.banks = response.data || [];
      },
      error: (error) => {
        console.error('Error loading banks:', error);
      },
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      type: [this.data.record.type_enum?.toLowerCase() || 'bank', [Validators.required]],
      bank_id: [this.data.record.bank?.id || this.data.record.bank_id, [Validators.required]],
      account_holder_name: [this.data.record.account_holder_name, [Validators.required]],
      account_number: [this.data.record.account_number, [Validators.required, onlyNumbers(), noSpaceAllowed()]],
      is_active: [this.data.record.is_active !== undefined ? (this.data.record.is_active === true ? 1 : 0) : 1, [Validators.required]],
      logo_path: [''],
      qr_code_path: [''],
      min_deposit_amount: [this.data.record.min_deposit_amount, [Validators.required, onlyNumbers()]],
      max_deposit_amount: [this.data.record.max_deposit_amount, [Validators.required, onlyNumbers()]],
      bank_transaction_fee: [this.data.record.bank_transaction_fee || '', [onlyNumbers()]],
      bank_transaction_subsidi: [this.data.record.bank_transaction_subsidi || '', [onlyNumbers()]],
    });

    if (this.data.record.logo_path) {
      this.logoPreview = this.data.record.logo_path;
    }
    if (this.data.record.qr_code_path) {
      this.qrCodePreview = this.data.record.qr_code_path;
    }
  }

  public onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e: any): void => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  public onQrCodeSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedQrCode = file;
      const reader = new FileReader();
      reader.onload = (e: any): void => {
        this.qrCodePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    Object.keys(this.form.value).forEach((key) => {
      if (this.form.value[key] !== null && this.form.value[key] !== undefined && this.form.value[key] !== '') {
        formData.append(key, this.form.value[key]);
      }
    });

    if (this.selectedLogo) {
      formData.append('logo_path', this.selectedLogo);
    }

    if (this.selectedQrCode) {
      formData.append('qr_code_path', this.selectedQrCode);
    }

    const action = this.data.action;
    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.bankAccountsService.update(formData, this.data.record.id)
        : (): Observable<any> => this.bankAccountsService.create(formData);

    serviceMethod()
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.form.reset();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
