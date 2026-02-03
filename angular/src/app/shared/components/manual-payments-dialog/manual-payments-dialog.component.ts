import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { cleanCommasFormData, formatNumberWithCommas, getLoggedInUserType, getUserTypeByURL } from '../../functions/core.function';
import { ManualTransactionsService } from '../../services/manual-transactions.service';
import { MessageService } from '../../services/message.service';
import { commaNumbersWithNegatives, noSpaceAllowed } from '../../validators/common-validators';
import { DialogWrapperModule } from '../dialog-wrapper/dialog-wrapper.module';
import { SubmitButtonComponent } from '../submit-button/submit-button.component';

@Component({
  selector: 'app-manual-payments-dialog',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogWrapperModule,
    MatDialogActions,
    MatDividerModule,
    MatDialogContent,
    MatDialogClose,
    MatInputModule,
    SubmitButtonComponent,
  ],
  templateUrl: './manual-payments-dialog.component.html',
})
export class ManualPaymentsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private messageService = inject(MessageService);
  private manualTransactionsService = inject(ManualTransactionsService);
  private dialogRef = inject<MatDialogRef<ManualPaymentsDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  protected readonly loggedInUserType: string = getLoggedInUserType() || '';
  protected selectedUserType: string = 'agent';
  public isSubmitting: boolean = false;
  public form: FormGroup;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  constructor() {
    this.selectedUserType = getUserTypeByURL();
  }

  public ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    if (this.loggedInUserType === 'AGENT') {
      this.initializeAgentForm();
    } else {
      this.initializeAdminForm();
    }
  }

  private initializeAdminForm(): void {
    this.form = this.fb.group({
      money: ['', [noSpaceAllowed(), commaNumbersWithNegatives()]],
      money_memo: ['', []],
      coupon_points: ['', [noSpaceAllowed(), commaNumbersWithNegatives()]],
      coupon_points_memo: ['', []],
      points: ['', [noSpaceAllowed(), commaNumbersWithNegatives()]],
      points_memo: ['', []],
    });
  }

  private initializeAgentForm(): void {
    this.form = this.fb.group({
      coupon_points: ['', [noSpaceAllowed(), commaNumbersWithNegatives()]],
      coupon_points_memo: ['', []],
    });
  }

  public formatNumber(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = formatNumberWithCommas(input.value);
    this.formControls[controlName].setValue(formattedValue, { emitEvent: false });
  }

  public onSubmit(): void {
    this.isSubmitting = true;
    const formData = cleanCommasFormData(this.form.value, ['money', 'coupon_points', 'points']);

    this.manualTransactionsService
      .pay(formData, this.data.record.id)
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
