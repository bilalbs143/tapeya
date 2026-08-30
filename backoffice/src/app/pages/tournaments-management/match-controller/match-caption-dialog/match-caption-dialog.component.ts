import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialModule } from 'src/app/material.module';
import { MatchGraphicService, type MatchGraphicCaption } from 'src/app/services/match-graphic.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface MatchCaptionDialogData {
  matchId: number;
  caption?: MatchGraphicCaption | null;
}

@Component({
  selector: 'app-match-caption-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
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

  public deleteCaption(): void {
    const existing = this.data.caption;
    if (!existing || this.saving) {
      return;
    }
    this.messageService
      .prompt('Delete Caption', `Remove "${existing.title}"?`, 'Delete', 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.saving = true;
        this.graphicService.deleteCaption(this.data.matchId, existing.id).subscribe({
          next: () => {
            this.saving = false;
            this.dialogRef.close(true);
          },
          error: (err: unknown) => {
            this.saving = false;
            this.messageService.httpError(err);
          },
        });
      });
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
