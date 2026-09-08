import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import { LiveStreamService, type YoutubeStreamKeyDetail } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface EditYoutubeStreamKeyDialogData {
  keyId: number;
}

type CopyField = 'rtmp' | 'key';
type KeyAction = 'save';

@Component({
  selector: 'app-edit-youtube-stream-key-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './edit-youtube-stream-key-dialog.component.html',
})
export class EditYoutubeStreamKeyDialogComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<EditYoutubeStreamKeyDialogComponent, boolean>>(MatDialogRef);
  public readonly data = inject<EditYoutubeStreamKeyDialogData>(MAT_DIALOG_DATA);
  private readonly streamApi = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  public key: YoutubeStreamKeyDetail | null = null;
  public loading = true;
  public form!: FormGroup;
  public activeAction: KeyAction | null = null;
  public copiedField: CopyField | null = null;
  private mutated = false;

  public ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      is_active: [true],
    });

    this.loadKey();
  }

  public get inUse(): boolean {
    return this.key?.in_use ?? false;
  }

  public loadKey(): void {
    this.loading = true;
    this.streamApi.getYoutubeStreamKey(this.data.keyId).subscribe({
      next: (key) => {
        this.key = key;
        this.form.patchValue({ title: key.title, is_active: key.is_active });
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.messageService.httpError(err, 'Failed to load stream key.');
      },
    });
  }

  public save(): void {
    if (this.form.invalid || this.activeAction) {
      this.form.markAllAsTouched();
      return;
    }

    this.activeAction = 'save';
    const { title, is_active } = this.form.getRawValue();

    this.streamApi.updateYoutubeStreamKey(this.data.keyId, { title: (title as string).trim(), is_active }).subscribe({
      next: (updated) => {
        this.activeAction = null;
        this.mutated = true;
        if (this.key) {
          this.key = { ...this.key, ...updated };
        }
        this.messageService.success('Stream key updated.');
      },
      error: (err: unknown) => {
        this.activeAction = null;
        this.messageService.httpError(err);
      },
    });
  }

  public copyField(field: CopyField, value: string | null | undefined): void {
    if (!value?.trim()) {
      return;
    }
    void navigator.clipboard.writeText(value).then(() => {
      this.copiedField = field;
      this.snackBar.open('Copied to clipboard', undefined, { duration: 2000 });
      setTimeout(() => {
        if (this.copiedField === field) {
          this.copiedField = null;
        }
      }, 2500);
    });
  }

  public close(): void {
    this.dialogRef.close(this.mutated);
  }
}
