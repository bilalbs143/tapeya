import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { BlacklistedIpsManagementService } from '../../../shared/services/blacklisted-ips-management.service';
import { MessageService } from '../../../shared/services/message.service';

@Component({
  selector: 'app-manage-blacklisted-ips-dialog',
  templateUrl: './manage-blacklisted-ips-dialog.component.html',
  standalone: false,
})
export class ManageBlacklistedIpsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private blacklistIpsManagementService = inject(BlacklistedIpsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageBlacklistedIpsDialogComponent>>(MatDialogRef);
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
      ip: [this.data.record.ip, [Validators.required]],
      memo: [this.data.record.memo, [Validators.required]],
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
    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.blacklistIpsManagementService.update(formValue, this.data.record.id)
        : (): Observable<any> => this.blacklistIpsManagementService.create(formValue);

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
