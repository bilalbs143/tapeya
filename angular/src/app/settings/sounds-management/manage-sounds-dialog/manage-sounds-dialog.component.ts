import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { MessageService } from '../../../shared/services/message.service';
import { SoundsManagementService } from '../../../shared/services/sounds-management.service';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './manage-sounds-dialog.component.html',
  standalone: false,
})
export class ManageSoundsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private soundsManagementService = inject(SoundsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageSoundsDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;
  private selectedFile: File;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: [this.data.record.title, [Validators.required]],
      file: ['', [Validators.required]],
    });
  }

  public onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    Object.keys(this.form.value).forEach((key) => {
      formData.append(key, this.form.value[key]);
    });

    const action = this.data.action;
    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.soundsManagementService.update(formData, this.data.record.id)
        : (): Observable<any> => this.soundsManagementService.create(formData);

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
