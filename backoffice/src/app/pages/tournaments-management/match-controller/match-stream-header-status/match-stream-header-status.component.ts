import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';

import { matchStreamHeaderStatusLabel, matchStreamPresenceEligible } from '../match-stream.utils';

import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import { MatchStreamService, type MatchStreamStatus } from 'src/app/services/match-stream.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-match-stream-header-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-stream-header-status.component.html',
})
export class MatchStreamHeaderStatusComponent implements OnInit, OnChanges {
  @Input({ required: true }) public matchId!: number;
  /** Increment from parent after stream config dialog mutates setup. */
  @Input() public refreshToken = 0;

  private readonly streamApi = inject(MatchStreamService);
  private readonly messageService = inject(MessageService);
  private readonly reverbService = inject(BackofficeReverbService);
  private readonly destroyRef = inject(DestroyRef);

  public loading = true;
  public hasStream = false;
  public status: MatchStreamStatus | null = null;
  public viewerCount = 0;

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
    return matchStreamHeaderStatusLabel(this.status, this.hasStream);
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

    if (!this.hasStream) {
      return;
    }

    this.reverbService.connect();
    this.streamChannelCleanup = this.reverbService.listenMatchStream(this.matchId, (event) => {
      const next = event['status'] as MatchStreamStatus | undefined;
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

    if (!matchStreamPresenceEligible(this.status)) {
      return;
    }

    this.presenceChannelCleanup = this.reverbService.listenMatchPresence(this.matchId, (count) => {
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
