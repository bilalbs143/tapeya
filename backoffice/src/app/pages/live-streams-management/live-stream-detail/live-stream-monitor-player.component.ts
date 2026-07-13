import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { liveStreamMonitorMessage, liveStreamOpenUrl } from '../live-stream-playback.utils';

import type { LiveStreamPlayback, LiveStreamStatus } from 'src/app/services/live-stream.service';

@Component({
  selector: 'app-live-stream-monitor-player',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './live-stream-monitor-player.component.html',
})
export class LiveStreamMonitorPlayerComponent implements OnChanges {
  @Input({ required: true }) public status!: LiveStreamStatus | null;
  @Input() public playback: LiveStreamPlayback | null | undefined = null;
  @Input() public streamingUrl: string | null | undefined = null;
  @Input() public thumbnailUrl: string | null | undefined = null;

  private readonly sanitizer = inject(DomSanitizer);

  public safeEmbedUrl: SafeResourceUrl | null = null;
  public hlsUrl: string | null = null;
  public openUrl: string | null = null;
  public emptyMessage = '';

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['playback'] || changes['status'] || changes['streamingUrl']) {
      this.recompute();
    }
  }

  public get showIframe(): boolean {
    return !!this.safeEmbedUrl;
  }

  public get showHls(): boolean {
    return !!this.hlsUrl;
  }

  public get showThumbnailFallback(): boolean {
    return !this.showIframe && !this.showHls && !!this.thumbnailUrl;
  }

  private recompute(): void {
    this.safeEmbedUrl = null;
    this.hlsUrl = null;
    this.openUrl = liveStreamOpenUrl(this.playback ?? null, this.streamingUrl ?? null);
    this.emptyMessage = liveStreamMonitorMessage(this.status, !!this.playback);

    const playback = this.playback;
    if (!playback) {
      return;
    }

    if (playback.mode === 'iframe' && playback.embed_url) {
      this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(playback.embed_url);
      return;
    }

    if (playback.mode === 'hls' && playback.url) {
      this.hlsUrl = playback.url;
    }
  }
}
