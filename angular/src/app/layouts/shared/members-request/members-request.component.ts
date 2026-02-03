import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { AudioNotificationService } from 'src/app/shared/services/audio-notification.service';
import { PusherService } from 'src/app/shared/services/pusher.service';

import { StatsService } from '../../../shared/services/stats.service';

@Component({
  selector: 'app-members-request',
  imports: [MatCardModule, RouterModule, TranslateModule],
  templateUrl: './members-request.component.html',
})
export class MembersRequestComponent implements OnInit, OnDestroy {
  private statsService = inject(StatsService);
  private pusherService = inject(PusherService);
  private audioService = inject(AudioNotificationService);

  public isLoading: boolean = true;
  public requestsCounter: any;
  public eventType: string;
  private actionSubscription: Subscription;

  constructor() {
    this.loadHttpData();
    this.actionSubscription = this.statsService.isRequestProcessed$.subscribe(() => {
      this.loadHttpData();
    });
  }

  private showVisualNotification(data: any): void {
    // Fallback visual notification when audio fails
    console.log('Audio blocked - showing visual notification for:', data.sound.type_enum);

    // You can implement a toast, modal, or other visual indicator here
    // Example: this.toastService.show('New notification received');

    // For now, we'll just log it
    console.log('Visual notification for:', data.sound.type_enum);
  }

  public onEvent(data: any): void {
    if (data.sound && data.sound.type_enum) {
      this.eventType = data.sound.type_enum;
    }

    // Load data first, then update blink state
    this.loadHttpData();

    if (data.sound && data.sound.sound_file) {
      // Try to play audio notification
      this.audioService.playSound(data.sound.sound_file, 0.7).catch(() => {
        // If audio fails, show visual notification
        this.showVisualNotification(data);
      });
    } else {
      // No sound file, show visual notification
      this.showVisualNotification(data);
    }
  }

  private updateBlinkState(): void {
    // Clear eventType if there are no unprocessed requests for the current event type
    if (!this.eventType || !this.requestsCounter) {
      return;
    }

    const unprocessedCount = this.getUnprocessedCount(this.eventType);

    // Only clear if there are no unprocessed requests
    if (unprocessedCount === 0) {
      this.eventType = '';
    }
  }

  private getUnprocessedCount(eventType: string): number {
    if (!this.requestsCounter) {
      return 0;
    }

    switch (eventType) {
      case 'RECHARGE_REQUEST':
        return this.requestsCounter?.recharge_request?.unprocessed_count || 0;
      case 'WITHDRAW_REQUEST':
        return this.requestsCounter?.withdraw_request?.unprocessed_count || 0;
      case 'WITHDRAW_MONEY_ROLLING_MONEY':
        return this.requestsCounter?.withdraw_rolling_money?.unprocessed_count || 0;
      case 'LOSING_MONEY_WITHDRAW':
        return this.requestsCounter?.withdraw_losing_money?.unprocessed_count || 0;
      case 'MEMBERSHIP_REQUEST':
        return this.requestsCounter?.membership_request?.unprocessed_count || 0;
      case 'CUSTOMER_INQUIRY':
        return this.requestsCounter?.customer_inquiry?.unprocessed_count || 0;
      default:
        return 0;
    }
  }

  public ngOnInit(): void {
    this.pusherService.on('User\\CustomerInquiry\\NewCustomerInquiry', this.onEvent.bind(this));
    this.pusherService.on('User\\ExchangeRequest\\NewExchangeRequest', this.onEvent.bind(this));
    this.pusherService.on('Auth\\UserRegistered', this.onEvent.bind(this));
  }

  public ngOnDestroy(): void {
    this.actionSubscription.unsubscribe();
  }

  public loadHttpData(): void {
    this.isLoading = true;

    this.statsService
      .requestsCounter()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.requestsCounter = response.data;
          this.updateBlinkState();
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
