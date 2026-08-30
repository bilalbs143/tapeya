import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { LiveStreamDetailStateService } from './live-stream-detail-state.service';
import { LiveStreamMonitorPlayerComponent } from './live-stream-monitor-player.component';

@Component({
  selector: 'app-live-stream-settings-tab',
  standalone: true,
  imports: [CommonModule, LiveStreamMonitorPlayerComponent],
  templateUrl: './live-stream-settings-tab.component.html',
})
export class LiveStreamSettingsTabComponent {
  private readonly state = inject(LiveStreamDetailStateService);

  public get payload() {
    return this.state.payload;
  }

  public get stream() {
    return this.payload?.stream ?? null;
  }
}
