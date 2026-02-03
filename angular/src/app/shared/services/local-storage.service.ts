import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // Get data from local storage
  public get(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Set data to local storage
  public set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove data from local storage
  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all data from local storage
  public clear(): void {
    localStorage.clear();
  }
}
