import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { parseBooleanToIntString } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { PopupsManagementService } from '../../../shared/services/popups-management.service';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './manage-popups-dialog.component.html',
  standalone: false,
})
export class ManagePopupsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private popupsManagementService = inject(PopupsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManagePopupsDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;
  private selectedFile: File;
  public oldImageUrl: string | null;
  public newImagePreview: string | ArrayBuffer | null = null;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.oldImageUrl = this.data.record.image;
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: [this.data.record.title, [Validators.required]],
      is_active: [parseBooleanToIntString(this.data.record.is_active) || '1', [Validators.required]],
      image: ['', this.data.action === 'create' ? [Validators.required] : []],
    });
  }

  public onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    const eventTarget = event.target as HTMLInputElement;
    const file = eventTarget.files ? eventTarget.files[0] : null;

    if (file) {
      const reader = new FileReader();
      reader.onload = (): any => (this.newImagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const action = this.data.action;
    const formData = new FormData();

    if (action === 'UPDATE' && !this.form.value.image) {
      delete this.form.value.image;
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    Object.keys(this.form.value).forEach((key) => {
      formData.append(key, this.form.value[key]);
    });

    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.popupsManagementService.update(formData, this.data.record.id)
        : (): Observable<any> => this.popupsManagementService.create(formData);

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
