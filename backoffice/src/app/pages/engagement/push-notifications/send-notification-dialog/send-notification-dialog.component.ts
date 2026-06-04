import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { finalize } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

@Component({
  selector: 'app-send-notification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDivider,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './send-notification-dialog.component.html',
})
export class SendNotificationDialogComponent {
  private readonly pushService = inject(PushNotificationService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject<MatDialogRef<SendNotificationDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting = false;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      body: ['', [Validators.required, Validators.maxLength(200)]],
      image_url: ['', [Validators.maxLength(2048)]],
    });
  }

  public submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const value = this.form.getRawValue();

    this.pushService
      .send({
        title: value.title.trim(),
        body: value.body.trim(),
        image_url: value.image_url?.trim() || null,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.messageService.error('Failed to send push notification. Please try again.'),
      });
  }
}
