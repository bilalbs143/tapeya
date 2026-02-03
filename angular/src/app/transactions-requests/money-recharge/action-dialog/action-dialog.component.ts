import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { cleanCommasFormData, formatNumberCustom, formatNumberWithCommas } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { TransactionRequestsService } from '../../../shared/services/transaction-requests.service';
import { commaNumbers, noSpaceAllowed } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-money-recharge-action-dialog',
  templateUrl: './action-dialog.component.html',
  standalone: false,
})
export class MoneyRechargeActionDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<MoneyRechargeActionDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private readonly transactionRequestsService = inject(TransactionRequestsService);
  private readonly messageService = inject(MessageService);

  public requestedMoney: number;
  public isFirstRecharge: boolean = false;
  private transactionId: number;
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.requestedMoney = this.data.record.requested_money;
    this.transactionId = this.data.record.id;
    this.isFirstRecharge = this.data.record.is_first_request;
    this.initialiseForm();
  }

  private initialiseForm(): void {
    this.form = this.fb.group({
      approved_money: [formatNumberCustom(this.requestedMoney), [Validators.required, noSpaceAllowed(), commaNumbers()]],
    });
  }

  public formatNumber(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = formatNumberWithCommas(input.value);
    this.formControls[controlName].setValue(formattedValue, { emitEvent: false });
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
