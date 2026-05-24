import { Injectable, inject } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { ADMIN_BACKOFFICE_BROADCAST_EVENTS } from 'src/app/config/broadcast-events';
import { environment } from 'src/environments/environment';

import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';

@Injectable({ providedIn: 'root' })
export class BackofficeReverbService {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationsService);

  private echo: InstanceType<typeof Echo> | null = null;
  private tokenUsedForEcho: string | null = null;

  /**
   * Subscribe to shared admin inbox WebSocket events (requires Reverb + BROADCAST_CONNECTION=reverb on API).
   * Recreates Echo when the bearer token changes (e.g. re-login without full page reload).
   */
  public connect(): void {
    if (!environment.reverb.enabled) {
      return;
    }

    const token = this.auth.getAccessToken();
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.echo && this.tokenUsedForEcho === token) {
      return;
    }

    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    const w = window as unknown as { Pusher: typeof Pusher };
    w.Pusher = Pusher;

    const apiOrigin = new URL(environment.apiBaseUrl).origin;
    const { appKey, wsHost, wsPort, wssPort, scheme } = environment.reverb;
    const forceTLS = scheme === 'https';

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost,
      wsPort,
      wssPort,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${apiOrigin}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    this.tokenUsedForEcho = token;

    const channel = this.echo.private('backoffice.notifications');
    const onAdminInbox = () => this.notifications.notifyAdminInboxBroadcast();
    for (const eventName of ADMIN_BACKOFFICE_BROADCAST_EVENTS) {
      channel.listen(eventName, onAdminInbox);
    }
  }

  /**
   * Subscribe to the public `match.{matchId}.graphics` channel.
   *
   * Returns a cleanup function — call it in ngOnDestroy / DestroyRef.onDestroy()
   * to leave the channel when the match controller page unmounts.
   *
   * @param onActivated  Called when a graphic command is activated (`.match.graphic.activated`)
   * @param onCaptionChanged  Called when a caption is saved or deleted (`.match.graphic.caption.changed`)
   */
  public listenMatchGraphics(
    matchId: number,
    onActivated: (event: Record<string, unknown>) => void,
    onCaptionChanged: () => void
  ): () => void {
    if (!this.echo || !environment.reverb.enabled) {
      return (): void => {
        return;
      };
    }
    const channelName = `match.${matchId}.graphics`;
    const channel = this.echo.channel(channelName);
    channel.listen('.match.graphic.activated', onActivated);
    channel.listen('.match.graphic.caption.changed', onCaptionChanged);
    return () => {
      this.echo?.leaveChannel(channelName);
    };
  }

  /**
   * Subscribe to the public `match.{matchId}.stream` channel for live status updates.
   */
  public listenMatchStream(matchId: number, onStatusUpdated: (event: Record<string, unknown>) => void): () => void {
    if (!this.echo || !environment.reverb.enabled) {
      return (): void => {
        return;
      };
    }
    const channelName = `match.${matchId}.stream`;
    const channel = this.echo.channel(channelName);
    channel.listen('.match.stream.status.updated', onStatusUpdated);
    return () => {
      this.echo?.leaveChannel(channelName);
    };
  }

  /**
   * Join `match.{matchId}.presence` for live viewer count (operators see "X watching").
   * Does not subscribe to chat — separate channel per architecture.
   */
  public listenMatchPresence(matchId: number, onCountChange: (count: number) => void): () => void {
    if (!this.echo || !environment.reverb.enabled) {
      return (): void => {
        return;
      };
    }

    const channelName = `match.${matchId}.presence`;
    let count = 0;

    const channel = this.echo.join(channelName) as {
      here: (cb: (members: unknown[]) => void) => typeof channel;
      joining: (cb: (member: unknown) => void) => typeof channel;
      leaving: (cb: (member: unknown) => void) => typeof channel;
    };

    channel
      .here((members: unknown[]) => {
        count = members.length;
        onCountChange(count);
      })
      .joining(() => {
        count += 1;
        onCountChange(count);
      })
      .leaving(() => {
        count = Math.max(0, count - 1);
        onCountChange(count);
      });

    return () => {
      this.echo?.leave(channelName);
      onCountChange(0);
    };
  }

  public disconnect(): void {
    if (!this.echo) {
      return;
    }

    this.echo.disconnect();
    this.echo = null;
    this.tokenUsedForEcho = null;
  }
}
