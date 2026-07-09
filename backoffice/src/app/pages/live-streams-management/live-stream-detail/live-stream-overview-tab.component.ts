import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { liveStreamKindLabel, liveStreamOpenUrl } from '../live-stream-playback.utils';

import {
  liveStreamPresenceEligible,
  liveStreamStatusLabel,
  matchControllerLink,
} from 'src/app/pages/tournaments-management/match-controller/live-stream.utils';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

import { LiveStreamDetailStateService } from './live-stream-detail-state.service';

const PROVIDER_LABELS: Record<string, string> = {
  external: 'External URL',
  youtube: 'YouTube RTMP',
};

@Component({
  selector: 'app-live-stream-overview-tab',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, TablerIconsModule],
  templateUrl: './live-stream-overview-tab.component.html',
})
export class LiveStreamOverviewTabComponent {
  private readonly state = inject(LiveStreamDetailStateService);

  public readonly emptyCell = EMPTY_CELL;

  public get payload() {
    return this.state.payload;
  }

  public get stream() {
    return this.payload?.stream ?? null;
  }

  public providerLabel(): string {
    const provider = this.stream?.provider;
    return provider ? (PROVIDER_LABELS[provider] ?? provider) : this.emptyCell;
  }

  public kindLabel(): string {
    return liveStreamKindLabel(this.stream?.match_id, this.stream?.owner_user_id);
  }

  public statusLabel(): string {
    return liveStreamStatusLabel(this.stream?.status ?? null);
  }

  public watchingDisplay(): string {
    if (!liveStreamPresenceEligible(this.stream?.status)) {
      return this.emptyCell;
    }
    return String(this.payload?.watching_count ?? 0);
  }

  public openStreamUrl(): string | null {
    return liveStreamOpenUrl(this.payload?.playback ?? null, this.stream?.streaming_url ?? null);
  }

  public matchLink(): (string | number)[] | null {
    return this.stream?.match_id ? matchControllerLink(this.stream.match_id) : null;
  }
}
