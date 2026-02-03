import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { cleanCommasFormData, formatNumberCustom, formatNumberWithCommas } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { TransactionRequestsService } from '../../../shared/services/transaction-requests.service';
import { commaNumbers, noSpaceAllowed } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-losing-money-withdraw-action-dialog',
  templateUrl: './action-dialog.component.html',
  standalone: false,
})
export class LosingMoneyWithdrawActionDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<LosingMoneyWithdrawActionDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private readonly transactionRequestsService = inject(TransactionRequestsService);
  private readonly messageService = inject(MessageService);

  public requestedMoney: number;
  private transactionId: number;
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.requestedMoney = this.data.record.requested_money;
    this.transactionId = this.data.record.id;
    this.initialiseForm();
  }

  public formatNumber(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = formatNumberWithCommas(input.value);
    this.formControls[controlName].setValue(formattedValue, { emitEvent: false });
  }

  private initialiseForm(): void {
    this.form = this.fb.group({
      approved_money: [formatNumberCustom(this.requestedMoney), [Validators.required, noSpaceAllowed(), commaNumbers()]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = cleanCommasFormData(this.form.value, ['approved_money']);

    this.isSubmitting = true;
    this.transactionRequestsService
      .approveTransactionRequest(formData, this.transactionId)
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
