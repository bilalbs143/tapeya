import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { AdminPost, PostPlayback } from 'src/app/services/post.service';
import { UiButtonComponent } from 'src/app/shared/components/ui-button/ui-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

/**
 * Admin moderation media preview: playable progressive video when available,
 * otherwise poster + open links (HLS is not reliable in Chrome without hls.js).
 */
@Component({
  selector: 'app-post-content-preview',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  templateUrl: './post-content-preview.component.html',
})
export class PostContentPreviewComponent {
  @Input({ required: true }) public post!: AdminPost;

  public readonly emptyCell = EMPTY_CELL;

  public openExternal(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  public get playback(): PostPlayback | null | undefined {
    return this.post?.playback;
  }

  /** Prefer progressive MP4 (original) so Chrome can play natively in-dialog. */
  public progressiveVideoUrl(): string | null {
    const playback = this.playback;
    if (!playback) return null;
    if (playback.original_url) return playback.original_url;
    if (playback.type === 'original' && playback.url) return playback.url;
    return null;
  }

  public posterUrl(): string | null {
    return this.playback?.poster_url || this.post?.cover_url || null;
  }

  public hlsUrl(): string | null {
    const playback = this.playback;
    if (!playback) return null;
    if (playback.hls_url) return playback.hls_url;
    if (playback.type === 'hls' && playback.url) return playback.url;
    return null;
  }

  public openUrl(): string | null {
    return this.progressiveVideoUrl() || this.hlsUrl() || this.playback?.url || null;
  }

  public formatDuration(ms: number | null | undefined): string {
    if (ms == null || !Number.isFinite(ms) || ms <= 0) return this.emptyCell;
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
