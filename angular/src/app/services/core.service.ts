import { Injectable, signal } from '@angular/core';

import { AppSettings, defaults } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private optionsSignal = signal<AppSettings>(defaults);
  private localStorageKey = 'appSettings';

  private options: AppSettings = this.loadOptions();

  constructor() {
    // Initialize both signal and local property with loaded options
    const loadedOptions = this.loadOptions();
    this.options = loadedOptions;
    this.optionsSignal.set(loadedOptions);
  }

  public getOptions(): AppSettings {
    return this.optionsSignal();
  }

  public setOptions(options: Partial<AppSettings>): void {
    const updatedOptions = { ...this.options, ...options };
    this.options = updatedOptions;
    this.optionsSignal.set(updatedOptions);

    // Save to localStorage
    this.saveOptionsToLocal();
  }

  public getLanguage(): string {
    return this.options.language;
  }

  public setLanguage(lang: string): void {
    this.options.language = lang;
    this.saveOptionsToLocal();
  }

  private loadOptions(): any {
    const savedOptions = localStorage.getItem(this.localStorageKey);
    return savedOptions ? JSON.parse(savedOptions) : defaults;
  }

  private saveOptionsToLocal(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.options));
  }
}
