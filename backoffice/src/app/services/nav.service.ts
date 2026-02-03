import { inject, Injectable, signal } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavService {
  private readonly router = inject(Router);

  showClass = false;
  currentUrl = signal<string | undefined>(undefined);

  constructor() {
    this.router.events.subscribe((event: Event): void => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }
}
