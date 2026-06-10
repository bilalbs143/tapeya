import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import { MatchStreamService, type MatchStreamPayload, type MatchStreamStatus } from 'src/app/services/match-stream.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-match-stream-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './match-stream-panel.component.html',
  styleUrl: './match-stream-panel.component.scss',
})
export class MatchStreamPanelComponent implements OnInit {
  @Input({ required: true }) public matchId!: number;
  @Input() public homeTeamName = 'Home';
  @Input() public awayTeamName = 'Away';

  private readonly streamApi = inject(MatchStreamService);
  private readonly messageService = inject(MessageService);
  private readonly reverbService = inject(BackofficeReverbService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  public payload: MatchStreamPayload | null = null;
  public loading = true;
  public busy = false;
  public privacy: 'public' | 'unlisted' = 'public';
  public copiedField: 'rtmp' | 'key' | 'backup' | null = null;
  public viewerCount = 0;

  private streamChannelCleanup: (() => void) | null = null;
  private presenceChannelCleanup: (() => void) | null = null;

  public ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.streamChannelCleanup?.();
      this.streamChannelCleanup = null;
      this.presenceChannelCleanup?.();
      this.presenceChannelCleanup = null;
    });
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

  public get isPresenceEligible(): boolean {
    const status = this.stream?.status;
    return status === 'live' || status === 'starting';
  }

  public get isLive(): boolean {
    return this.stream?.status === 'live';
  }

  public statusLabel(status: MatchStreamStatus | undefined): string {
    if (!status) {
      return 'No stream';
    }
    const labels: Record<MatchStreamStatus, string> = {
      idle: 'Idle — waiting for OBS',
      starting: 'Connecting…',
      live: 'Live',
      ended: 'Ended',
      error: 'Error',
    };
    return labels[status] ?? status;
  }

  public statusChipColor(status: MatchStreamStatus | undefined): ThemePalette | undefined {
    switch (status) {
      case 'live':
      case 'error':
        return 'warn';
      case 'starting':
        return 'accent';
      default:
        return undefined;
    }
  }

  public statusChipHighlighted(status: MatchStreamStatus | undefined): boolean {
    return status === 'live' || status === 'starting' || status === 'error';
  }

  public loadStream(): void {
    this.loading = true;
    this.streamApi.getStream(this.matchId).subscribe({
      next: (data) => {
        this.payload = data;
        this.loading = false;
        this.subscribeToStreamChannel();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.messageService.httpError(err);
      },
    });
  }

  public startStream(): void {
    const replaceExisting = this.hasStream && !this.isLive;
    if (replaceExisting) {
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
            this.doStartStream();
          }
        });
      return;
    }
    this.doStartStream();
  }

  private doStartStream(): void {
    this.busy = true;
    const title = `${this.homeTeamName} vs ${this.awayTeamName}`;
    this.streamApi.createStream(this.matchId, { title, privacy: this.privacy }).subscribe({
      next: (data) => {
        this.busy = false;
        this.payload = data;
        this.subscribeToStreamChannel();
        this.messageService.success('Stream created. Copy RTMP settings into OBS or vMix.');
      },
      error: (err: unknown) => {
        this.busy = false;
        this.messageService.httpError(err);
      },
    });
  }

  public endStream(): void {
    this.messageService
      .prompt('End Stream', 'Stop the YouTube broadcast? Viewers will see the stream as ended.', 'End Stream', 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.busy = true;
        this.streamApi.endStream(this.matchId).subscribe({
          next: () => {
            this.busy = false;
            this.messageService.success('Stream Ended.');
            this.loadStream();
          },
          error: (err: unknown) => {
            this.busy = false;
            this.messageService.httpError(err);
          },
        });
      });
  }

  public deleteStream(): void {
    this.messageService
      .prompt('Delete Stream', 'Remove this stream from Tapeya and delete the YouTube broadcast?', 'Delete', 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.busy = true;
        this.streamApi.deleteStream(this.matchId).subscribe({
          next: () => {
            this.busy = false;
            this.streamChannelCleanup?.();
            this.streamChannelCleanup = null;
            this.presenceChannelCleanup?.();
            this.presenceChannelCleanup = null;
            this.viewerCount = 0;
            this.messageService.success('Stream Deleted.');
            this.loadStream();
          },
          error: (err: unknown) => {
            this.busy = false;
            this.messageService.httpError(err);
          },
        });
      });
  }

  public syncStatus(): void {
    this.busy = true;
    this.streamApi.syncStream(this.matchId).subscribe({
      next: ({ status }) => {
        this.busy = false;
        if (this.stream) {
          this.stream.status = status;
        }
        this.syncPresenceSubscription();
        this.messageService.success(`Status Synced: ${this.statusLabel(status)}`);
      },
      error: (err: unknown) => {
        this.busy = false;
        this.messageService.httpError(err);
      },
    });
  }

  public copyField(field: 'rtmp' | 'key' | 'backup', value: string | null | undefined): void {
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

  public copyIcon(field: 'rtmp' | 'key' | 'backup'): string {
    return this.copiedField === field ? 'check' : 'content_copy';
  }

  private subscribeToStreamChannel(): void {
    this.streamChannelCleanup?.();
    this.presenceChannelCleanup?.();
    this.viewerCount = 0;

    if (!this.hasStream) {
      return;
    }

    this.reverbService.connect();
    this.streamChannelCleanup = this.reverbService.listenMatchStream(this.matchId, (event) => {
      const status = event['status'] as MatchStreamStatus | undefined;
      if (status && this.stream) {
        this.stream.status = status;
        this.syncPresenceSubscription();
      }
    });

    this.syncPresenceSubscription();
  }

  private syncPresenceSubscription(): void {
    this.presenceChannelCleanup?.();
    this.presenceChannelCleanup = null;
    this.viewerCount = 0;

    if (!this.isPresenceEligible) {
      return;
    }

    this.presenceChannelCleanup = this.reverbService.listenMatchPresence(this.matchId, (count) => {
      this.viewerCount = count;
    });
  }
}
