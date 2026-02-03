import { Component, HostListener, inject } from '@angular/core';

import { AudioNotificationService } from './shared/services/audio-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  public title = '';
  private audioService = inject(AudioNotificationService);

  @HostListener('document:click')
  onDocumentClick(): void {
    this.audioService.handleUserInteraction().catch((error) => {
      console.warn('Failed to handle user interaction:', error);
    });
  }

  @HostListener('document:keydown')
  onDocumentKeydown(): void {
    this.audioService.handleUserInteraction().catch((error) => {
      console.warn('Failed to handle user interaction:', error);
    });
  }

  @HostListener('document:touchstart')
  onDocumentTouchstart(): void {
    this.audioService.handleUserInteraction().catch((error) => {
      console.warn('Failed to handle user interaction:', error);
    });
  }

  @HostListener('document:mousedown')
  onDocumentMousedown(): void {
    this.audioService.handleUserInteraction().catch((error) => {
      console.warn('Failed to handle user interaction:', error);
    });
  }
}
