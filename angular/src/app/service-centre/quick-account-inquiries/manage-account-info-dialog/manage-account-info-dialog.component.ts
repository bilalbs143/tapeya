import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { finalize } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../../shared/constants/constants';
import { MessageService } from '../../../shared/services/message.service';
import { SystemSettingsService } from '../../../shared/services/system-settings.service';

@Component({
  selector: 'app-manage-templates-dialog',
  templateUrl: './manage-account-info-dialog.component.html',
  standalone: false,
})
export class ManageAccountInfoDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private dialogRef = inject<MatDialogRef<ManageAccountInfoDialogComponent>>(MatDialogRef);
  private systemSettingsService = inject(SystemSettingsService);
  private messageService = inject(MessageService);

  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm();
    this.getAccountInfo();
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      value: [' ', [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.systemSettingsService
      .update(this.form.value, 'bank_info_for_quick_inquiry')
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }

  private getAccountInfo(): void {
    this.systemSettingsService.get('bank_info_for_quick_inquiry').subscribe({
      next: (response) => {
        this.form.patchValue({
          value: response.data.value,
        });
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
