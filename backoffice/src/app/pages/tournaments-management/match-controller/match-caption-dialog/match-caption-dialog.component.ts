import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatchGraphicService, type MatchGraphicCaption } from 'src/app/services/match-graphic.service';
import { MessageService } from 'src/app/services/message.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface MatchCaptionDialogData {
  matchId: number;
  caption?: MatchGraphicCaption | null;
}

@Component({
  selector: 'app-match-caption-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './match-caption-dialog.component.html',
})
export class MatchCaptionDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<MatchCaptionDialogComponent, boolean>);
  private readonly graphicService = inject(MatchGraphicService);
  private readonly messageService = inject(MessageService);
  public readonly data = inject<MatchCaptionDialogData>(MAT_DIALOG_DATA);

  public saving = false;

  public readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(500)]],
    description: ['', [Validators.required, Validators.maxLength(20000)]],
  });

  constructor() {
    const c = this.data.caption;
    if (c) {
      this.form.patchValue({ title: c.title, description: c.description });
    }
  }

  public save(): void {
    if (this.form.invalid || this.saving) {
      return;
    }
    const v = this.form.getRawValue();
    const matchId = this.data.matchId;
    const existing = this.data.caption;

    this.saving = true;
    const req = existing
      ? this.graphicService.updateCaption(matchId, existing.id, v)
      : this.graphicService.createCaption(matchId, v);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        this.saving = false;
        this.messageService.httpError(err);
      },
    });
  }
}
