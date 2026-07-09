import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { liveStreamKindLabel } from '../live-stream-playback.utils';
import { LiveStreamManageDialogComponent } from '../live-streams/live-stream-manage-dialog/live-stream-manage-dialog.component';

import {
  liveStreamPresenceEligible,
  liveStreamStatusLabel,
} from 'src/app/pages/tournaments-management/match-controller/live-stream.utils';
import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import {
  LiveStreamService,
  type LiveStreamListItem,
  type LiveStreamPayload,
  type LiveStreamStatus,
} from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { LiveStreamDetailStateService } from './live-stream-detail-state.service';

const LIVE_STREAM_DIALOG_OPTIONS = { widthSize: 'md' as const, disableClose: true };

type StreamHeaderAction = 'sync' | 'end';

const PROVIDER_LABELS: Record<string, string> = {
  external: 'External URL',
  youtube: 'YouTube RTMP',
};

@Component({
  selector: 'app-live-stream-detail-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    TablerIconsModule,
    SubmitButtonComponent,
  ],
  providers: [LiveStreamDetailStateService],
  templateUrl: './live-stream-detail-shell.component.html',
})
export class LiveStreamDetailShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly streamApi = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly reverbService = inject(BackofficeReverbService);
  private readonly state = inject(LiveStreamDetailStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sub = new Subscription();

  public payload: LiveStreamPayload | null = null;
  public isLoading = true;
  public viewerCount = 0;
  public activeAction: StreamHeaderAction | null = null;
  public readonly statusClass = getStatusClass;

  private streamChannelCleanup: (() => void) | null = null;
  private presenceChannelCleanup: (() => void) | null = null;

  public ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.activeAction = null;
      this.teardownChannels();
    });

    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const id = Number(params.get('streamId'));
        if (!Number.isFinite(id) || id <= 0) {
          void this.router.navigate(['/live-streams-management/live-streams']);
          return;
        }
        this.loadStream(id);
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.teardownChannels();
  }

  public get stream() {
    return this.payload?.stream ?? null;
  }

  public statusLabel(): string {
    return liveStreamStatusLabel(this.stream?.status ?? null);
  }

  public providerLabel(): string {
    const provider = this.stream?.provider;
    return provider ? (PROVIDER_LABELS[provider] ?? provider) : '—';
  }

  public kindLabel(): string {
    return liveStreamKindLabel(this.stream?.match_id, this.stream?.owner_user_id);
  }

  public watchingDisplay(): string {
    if (!liveStreamPresenceEligible(this.stream?.status)) {
      return '—';
    }
    return String(this.viewerCount);
  }

  public presenceEligible(): boolean {
    return liveStreamPresenceEligible(this.stream?.status);
  }

  public get isYoutube(): boolean {
    return this.stream?.provider === 'youtube';
  }

  public canEndStream(): boolean {
    const status = this.stream?.status;
    return status === 'live' || status === 'starting';
  }

  public syncStatus(): void {
    const id = this.state.streamId;
    if (!id || this.activeAction) {
      return;
    }

    this.activeAction = 'sync';
    this.streamApi
      .syncStreamById(id)
      .pipe(finalize(() => (this.activeAction = null)))
      .subscribe({
        next: ({ status }) => {
          if (this.payload?.stream) {
            this.payload = {
              ...this.payload,
              stream: { ...this.payload.stream, status },
            };
          }
          this.state.patchStatus(status);
          this.reloadStream();
          this.messageService.success(`Status synced: ${liveStreamStatusLabel(status)}`);
        },
        error: () => this.messageService.error('Failed to sync stream status.'),
      });
  }

  public endStream(): void {
    const id = this.state.streamId;
    if (!id || this.activeAction) {
      return;
    }

    this.messageService
      .prompt('End Stream', 'End this broadcast immediately for all viewers?', 'End Stream', 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }

        this.activeAction = 'end';
        this.streamApi
          .endStreamById(id)
          .pipe(finalize(() => (this.activeAction = null)))
          .subscribe({
            next: () => {
              this.state.patchStatus('ended');
              this.reloadStream();
              this.messageService.success('Stream ended.');
            },
            error: () => this.messageService.error('Failed to end live stream.'),
          });
      });
  }

  public openManageDialog(): void {
    const stream = this.stream;
    const id = this.state.streamId;
    if (!stream || !id) {
      return;
    }

    const listRow: LiveStreamListItem = {
      id,
      title: stream.title,
      description: stream.description,
      streaming_url: stream.streaming_url,
      status: stream.status,
      provider: stream.provider,
      match_id: stream.match_id,
      started_at: stream.started_at,
      owner_user_id: stream.owner_user_id,
      watching_count: this.payload?.watching_count,
    };

    this.messageService.openDialog<LiveStreamManageDialogComponent, boolean>(
      LiveStreamManageDialogComponent,
      { stream: listRow },
      (mutated) => {
        if (mutated) {
          this.reloadStream();
        }
      },
      LIVE_STREAM_DIALOG_OPTIONS
    );
  }

  private loadStream(id: number): void {
    this.isLoading = true;
    this.payload = null;
    this.state.streamId = id;
    this.viewerCount = 0;
    this.teardownChannels();

    this.streamApi.getStreamById(id).subscribe({
      next: (payload) => {
        this.payload = payload;
        this.state.patchPayload(payload);
        this.viewerCount = payload.watching_count ?? 0;
        this.isLoading = false;
        this.subscribeToRealtime(id);
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load live stream.');
        void this.router.navigate(['/live-streams-management/live-streams']);
      },
    });
  }

  public reloadStream(): void {
    const id = this.state.streamId;
    if (!id) {
      return;
    }

    this.streamApi.getStreamById(id).subscribe({
      next: (payload) => {
        this.payload = payload;
        this.state.patchPayload(payload);
        this.viewerCount = payload.watching_count ?? 0;
        this.syncPresenceSubscription(payload.stream?.status ?? null, id);
      },
      error: () => this.messageService.error('Failed to refresh live stream.'),
    });
  }

  private subscribeToRealtime(streamId: number): void {
    this.reverbService.connect();
    this.streamChannelCleanup = this.reverbService.listenLiveStream(streamId, (event) => {
      const next = event['status'] as LiveStreamStatus | undefined;
      if (next && this.payload?.stream) {
        this.payload = {
          ...this.payload,
          stream: { ...this.payload.stream, status: next },
        };
        this.state.patchStatus(next);
        this.syncPresenceSubscription(next, streamId);
        if (next === 'live' || next === 'ended') {
          this.reloadStream();
        }
      }
    });

    this.syncPresenceSubscription(this.stream?.status ?? null, streamId);
  }

  private syncPresenceSubscription(status: LiveStreamStatus | null, streamId: number): void {
    this.presenceChannelCleanup?.();
    this.presenceChannelCleanup = null;

    if (!liveStreamPresenceEligible(status)) {
      this.viewerCount = 0;
      return;
    }

    this.presenceChannelCleanup = this.reverbService.listenLiveStreamPresence(streamId, (count) => {
      this.viewerCount = count;
      this.state.patchWatchingCount(count);
    });
  }

  private teardownChannels(): void {
    this.streamChannelCleanup?.();
    this.streamChannelCleanup = null;
    this.presenceChannelCleanup?.();
    this.presenceChannelCleanup = null;
  }
}
