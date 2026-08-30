import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, type Observable } from 'rxjs';

import { liveStreamStatusLabel } from '../live-stream.utils';

import { MaterialModule } from 'src/app/material.module';
import { LiveStreamService, type LiveStreamPayload } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface LiveStreamDialogData {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  onStreamMutated?: () => void;
}

type StreamAction = 'sync' | 'start' | 'end' | 'delete';
type CopyField = 'rtmp' | 'key' | 'backup';

@Component({
  selector: 'app-live-stream-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './live-stream-dialog.component.html',
})
export class LiveStreamDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<LiveStreamDialogComponent>);
  private readonly streamApi = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly data = inject<LiveStreamDialogData>(MAT_DIALOG_DATA);

  public payload: LiveStreamPayload | null = null;
  public loading = true;
  public activeAction: StreamAction | null = null;
  public privacy: 'public' | 'unlisted' = 'public';
  public copiedField: CopyField | null = null;

  private mutated = false;

  public ngOnInit(): void {
    this.loadStream();
  }

  public get stream() {
    return this.payload?.stream ?? null;
  }

  public get ingest() {
    return this.payload?.ingest ?? null;
  }

  public get hasStream(): boolean {
    return !!this.stream;
  }

  public get isLive(): boolean {
    return this.stream?.status === 'live';
  }

  public get copyFields(): { field: CopyField; label: string; value: string }[] {
    const ingest = this.ingest;
    if (!ingest) {
      return [];
    }
    const fields: { field: CopyField; label: string; value: string }[] = [
      { field: 'rtmp', label: 'RTMP URL', value: ingest.rtmp_url },
      { field: 'key', label: 'Stream Key', value: ingest.stream_key },
    ];
    if (ingest.backup_rtmp_url) {
      fields.push({ field: 'backup', label: 'Backup RTMP URL', value: ingest.backup_rtmp_url });
    }
    return fields;
  }

  public loadStream(): void {
    this.loading = true;
    this.streamApi.getStream(this.data.matchId).subscribe({
      next: (payload) => {
        this.payload = payload;
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.messageService.httpError(err);
      },
    });
  }

  public startStream(): void {
    if (this.hasStream && !this.isLive) {
      this.messageService
        .prompt(
          'Replace Stream Setup?',
          'This will delete the current YouTube broadcast and create a new one with fresh RTMP credentials.',
          'Replace',
          'Cancel'
        )
        .afterClosed()
        .subscribe((ok) => {
          if (ok) {
            this.createStream();
          }
        });
      return;
    }

    this.createStream();
  }

  public endStream(): void {
    this.confirm(
      'End Stream',
      'Stop the YouTube broadcast? Viewers will see the stream as ended.',
      'End Stream',
      () => this.streamApi.endStream(this.data.matchId),
      () => {
        this.notifyStreamMutated();
        this.messageService.success('Stream Ended.');
        this.loadStream();
      },
      'end'
    );
  }

  public deleteStream(): void {
    this.confirm(
      'Delete Stream',
      'Remove this stream from Tapeya and delete the YouTube broadcast?',
      'Delete',
      () => this.streamApi.deleteStream(this.data.matchId),
      () => {
        this.notifyStreamMutated();
        this.messageService.success('Stream Deleted.');
        this.loadStream();
      },
      'delete'
    );
  }

  public syncStatus(): void {
    this.runAction(
      'sync',
      () => this.streamApi.syncStream(this.data.matchId),
      ({ status }) => {
        if (this.stream) {
          this.stream.status = status;
        }
        this.notifyStreamMutated();
        this.messageService.success(`Status Synced: ${liveStreamStatusLabel(status)}`);
      }
    );
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

  private createStream(): void {
    this.runAction(
      'start',
      () =>
        this.streamApi.createStream(this.data.matchId, {
          title: `${this.data.homeTeamName} vs ${this.data.awayTeamName}`,
          privacy: this.privacy,
        }),
      (payload) => {
        this.payload = payload;
        this.notifyStreamMutated();
        this.messageService.success('Stream created. Copy RTMP settings into OBS or vMix.');
      }
    );
  }

  private confirm<T>(
    title: string,
    message: string,
    confirmLabel: string,
    request: () => Observable<T>,
    onSuccess: (result: T) => void,
    action: StreamAction
  ): void {
    this.messageService
      .prompt(title, message, confirmLabel, 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.runAction(action, request, onSuccess);
        }
      });
  }

  private runAction<T>(action: StreamAction, request: () => Observable<T>, onSuccess: (result: T) => void): void {
    this.activeAction = action;
    request()
      .pipe(finalize(() => (this.activeAction = null)))
      .subscribe({
        next: onSuccess,
        error: (err: unknown) => this.messageService.httpError(err),
      });
  }

  private notifyStreamMutated(): void {
    this.mutated = true;
    this.data.onStreamMutated?.();
  }
}
