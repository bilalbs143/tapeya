import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';

import { liveStreamHeaderStatusLabel, liveStreamPresenceEligible } from '../live-stream.utils';

import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import { LiveStreamService, type LiveStreamStatus } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-live-stream-header-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-stream-header-status.component.html',
})
export class LiveStreamHeaderStatusComponent implements OnInit, OnChanges {
  @Input({ required: true }) public matchId!: number;
  /** Increment from parent after stream config dialog mutates setup. */
  @Input() public refreshToken = 0;

  private readonly streamApi = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly reverbService = inject(BackofficeReverbService);
  private readonly destroyRef = inject(DestroyRef);

  public loading = true;
  public hasStream = false;
  public status: LiveStreamStatus | null = null;
  public viewerCount = 0;
  public streamId: number | null = null;

  private streamChannelCleanup: (() => void) | null = null;
  private presenceChannelCleanup: (() => void) | null = null;

  public ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.teardownChannels());
    this.loadStatus();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshToken'] && !changes['refreshToken'].firstChange) {
      this.loadStatus();
    }
    if (changes['matchId'] && !changes['matchId'].firstChange) {
      this.loadStatus();
    }
  }

  public headerStatusLabel(): string {
    return liveStreamHeaderStatusLabel(this.status, this.hasStream);
  }

  public get showWatching(): boolean {
    return !this.loading && this.hasStream;
  }

  private loadStatus(): void {
    this.loading = true;
    this.streamApi.getStream(this.matchId).subscribe({
      next: (payload) => {
        this.hasStream = !!payload.stream;
        this.status = payload.stream?.status ?? null;
        this.streamId = payload.stream?.id ?? null;
        this.loading = false;
        this.subscribeToStreamChannel();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.hasStream = false;
        this.status = null;
        this.viewerCount = 0;
        this.teardownChannels();
        this.messageService.httpError(err);
      },
    });
  }

  private subscribeToStreamChannel(): void {
    this.teardownChannels();
    this.viewerCount = 0;

    if (!this.hasStream || !this.streamId) {
      return;
    }

    this.reverbService.connect();
    this.streamChannelCleanup = this.reverbService.listenLiveStream(this.streamId, (event) => {
      const next = event['status'] as LiveStreamStatus | undefined;
      if (next) {
        this.status = next;
        this.syncPresenceSubscription();
      }
    });

    this.syncPresenceSubscription();
  }

  private syncPresenceSubscription(): void {
    this.presenceChannelCleanup?.();
    this.presenceChannelCleanup = null;
    this.viewerCount = 0;

    if (!liveStreamPresenceEligible(this.status) || !this.streamId) {
      return;
    }

    this.presenceChannelCleanup = this.reverbService.listenLiveStreamPresence(this.streamId, (count) => {
      this.viewerCount = count;
    });
  }

  private teardownChannels(): void {
    this.streamChannelCleanup?.();
    this.streamChannelCleanup = null;
    this.presenceChannelCleanup?.();
    this.presenceChannelCleanup = null;
  }
}
