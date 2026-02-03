import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { BanksService } from '../../../shared/services/banks.service';
import { MessageService } from '../../../shared/services/message.service';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './manage-bank-dialog.component.html',
  standalone: false,
})
export class ManageBankDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private banksService = inject(BanksService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageBankDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      bank_name: [this.data.record.names?.en || this.data.record.bank_name || '', [Validators.required]],
      code: [this.data.record.code, [Validators.required]],
      is_active: [this.data.record.is_active !== undefined ? this.data.record.is_active : true, [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const action = this.data.action;
    const formValue = this.form.value;

    const submitData = {
      names: {
        en: formValue.bank_name,
        ko: formValue.bank_name,
        id: formValue.bank_name,
      },
      code: formValue.code,
      is_active: formValue.is_active,
    };

    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.banksService.update(submitData, this.data.record.id)
        : (): Observable<any> => this.banksService.create(submitData);

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
