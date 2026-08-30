import { Injectable, signal } from '@angular/core';

import { AppSettings, defaults } from '../config';

const STORAGE_KEY = 'tapeya-backoffice-settings';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private optionsSignal = signal<AppSettings>(this.loadStoredOptions());

  public getOptions(): AppSettings {
    return this.optionsSignal();
  }

  public setOptions(options: Partial<AppSettings>): void {
    this.optionsSignal.update((current) => {
      const next = { ...current, ...options };
      this.persistOptions(next);
      return next;
    });
  }

  private loadStoredOptions(): AppSettings {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...defaults };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...defaults };
      }
      const stored = JSON.parse(raw) as Partial<AppSettings>;
      return {
        theme: typeof stored.theme === 'string' ? stored.theme : defaults.theme,
        sidenavOpened: typeof stored.sidenavOpened === 'boolean' ? stored.sidenavOpened : defaults.sidenavOpened,
        sidenavCollapsed: typeof stored.sidenavCollapsed === 'boolean' ? stored.sidenavCollapsed : defaults.sidenavCollapsed,
      };
    } catch {
      return { ...defaults };
    }
  }

  private persistOptions(options: AppSettings): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch {
      // Ignore quota or other storage errors
    }
  }
}
