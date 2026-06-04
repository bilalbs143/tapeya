import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs/operators';

import { renderPushTemplate } from '../push-template-preview.util';

import { MessageService } from 'src/app/services/message.service';
import { type PushNotificationTemplate, PushNotificationService } from 'src/app/services/push-notification.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface ManagePushTemplateDialogData {
  template: PushNotificationTemplate;
}

@Component({
  selector: 'app-manage-push-template-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDivider,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-push-template-dialog.component.html',
})
export class ManagePushTemplateDialogComponent {
  public readonly data = inject<ManagePushTemplateDialogData>(MAT_DIALOG_DATA);
  private readonly pushService = inject(PushNotificationService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject<MatDialogRef<ManagePushTemplateDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting = false;
  public previewTitle = '';
  public previewBody = '';

  private readonly sampleData: Record<string, string>;

  constructor() {
    this.sampleData = { ...(this.data.template.sample_preview_data ?? {}) };
    this.form = this.fb.group({
      title_template: [this.data.template.title_template, [Validators.required, Validators.maxLength(255)]],
      body_template: [this.data.template.body_template, [Validators.required, Validators.maxLength(2000)]],
      is_active: [this.data.template.is_active],
    });

    this.updatePreview();
    this.form.valueChanges.subscribe(() => this.updatePreview());
  }

  public get availableVariables(): string[] {
    return this.data.template.available_variables ?? [];
  }

  public formatVariable(name: string): string {
    return `{{${name}}}`;
  }

  public submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const value = this.form.getRawValue();

    this.pushService
      .updateTemplate(this.data.template.id, {
        title_template: value.title_template.trim(),
        body_template: value.body_template.trim(),
        is_active: value.is_active,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.messageService.error('Failed to save push notification template. Please try again.'),
      });
  }

  public cancel(): void {
    this.dialogRef.close(false);
  }

  private updatePreview(): void {
    const value = this.form.getRawValue();
    this.previewTitle = renderPushTemplate(value.title_template ?? '', this.sampleData);
    this.previewBody = renderPushTemplate(value.body_template ?? '', this.sampleData);
  }
}
