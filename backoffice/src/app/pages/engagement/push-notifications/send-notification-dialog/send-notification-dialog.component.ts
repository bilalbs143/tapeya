import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

@Component({
  selector: 'app-send-notification-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
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
