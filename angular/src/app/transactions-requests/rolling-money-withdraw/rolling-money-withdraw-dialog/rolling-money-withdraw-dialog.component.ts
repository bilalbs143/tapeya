import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { AuthService } from '../../../shared/auth/auth.service';
import { cleanCommasFormData, formatNumberWithCommas } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { TransactionRequestsService } from '../../../shared/services/transaction-requests.service';
import { commaNumbers, noSpaceAllowed } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-losing-money-withdraw-dialog',
  templateUrl: './rolling-money-withdraw-dialog.component.html',
  standalone: false,
})
export class RollingMoneyWithdrawDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<RollingMoneyWithdrawDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private readonly transactionRequestsService = inject(TransactionRequestsService);
  private readonly messageService = inject(MessageService);

  public user: any;
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.getCurrentLoggedInUser();
    this.initialiseForm();
  }

  private initialiseForm(): void {
    this.form = this.fb.group({
      requested_money: ['', [Validators.required, noSpaceAllowed(), commaNumbers()]],
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

    const formData = cleanCommasFormData(this.form.value, ['requested_money']);

    this.isSubmitting = true;
    this.transactionRequestsService
      .rollingMoneyTransactionRequest({
        ...formData,
        type: 'withdraw_rolling_money',
      })
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

  public getCurrentLoggedInUser(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.user = response.data || '';
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
