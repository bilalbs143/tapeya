import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import type { LiveStreamPayload, LiveStreamStatus } from 'src/app/services/live-stream.service';

/** Scoped to LiveStreamDetailShellComponent — one payload shared across overview/settings tabs. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- provided on shell only
@Injectable()
export class LiveStreamDetailStateService {
  public streamId: number | null = null;
  public payload: LiveStreamPayload | null = null;
  /** Increment after settings mutations so overview refreshes player/metadata. */
  public readonly refreshToken$ = new Subject<number>();
  private refreshToken = 0;

  public get status(): LiveStreamStatus | null {
    return this.payload?.stream?.status ?? null;
  }

  public patchPayload(payload: LiveStreamPayload): void {
    this.payload = payload;
    this.bumpRefresh();
  }

  public patchStatus(status: LiveStreamStatus): void {
    if (this.payload?.stream) {
      this.payload = {
        ...this.payload,
        stream: { ...this.payload.stream, status },
      };
    }
  }

  public patchWatchingCount(count: number): void {
    if (this.payload) {
      this.payload = { ...this.payload, watching_count: count };
    }
  }

  public bumpRefresh(): void {
    this.refreshToken += 1;
    this.refreshToken$.next(this.refreshToken);
  }
}
