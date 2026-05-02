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

  public disconnect(): void {
    if (!this.echo) {
      return;
    }

    this.echo.disconnect();
    this.echo = null;
    this.tokenUsedForEcho = null;
  }
}
