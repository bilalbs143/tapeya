import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';

import { environment } from '../../../environments/environment';
import { getLoggedInUserType } from '../functions/core.function';

@Injectable({
  providedIn: 'root',
})
export class PusherService {
  public pusher: any;
  public backOfficeChannel: any;
  private isAuthenticated: boolean = false;
  private userToken: string | null = null;
  private userId: number | null = null;

  constructor() {
    this.initializePusher();
  }

  private initializePusher(): void {
    // Only initialize if user is authenticated and is an administrator
    if (this.isAuthenticated && getLoggedInUserType() === 'ADMINISTRATOR' && this.userToken && this.userId) {
      try {
        this.pusher = new Pusher(environment.PUSHER_APP_KEY, {
          cluster: environment.PUSHER_CLUSTER,
          authEndpoint: environment.PUSHER_AUTH_ENDPOINT,
          auth: {
            headers: {
              Authorization: `Bearer ${this.userToken}`,
            },
          },
        });

        this.backOfficeChannel = this.pusher.subscribe(`private-App.Models.User.${this.userId}`);
        console.log('Pusher service initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Pusher service:', error);
      }
    } else {
      console.log('User not authenticated or not administrator, skipping Pusher initialization');
    }
  }

  public setAuthenticationData(isAuthenticated: boolean, token: string | null, userId: number | null): void {
    this.isAuthenticated = isAuthenticated;
    this.userToken = token;
    this.userId = userId;

    if (isAuthenticated && token && userId) {
      this.initializePusher();
    } else {
      this.cleanup();
    }
  }

  public on(eventPath: string, cb: any): void {
    if (this.backOfficeChannel) {
      this.backOfficeChannel.bind(`App\\Events\\${eventPath}`, cb);
    }
  }

  public playAudio(sound: any): void {
    // Check if user is authenticated before playing audio
    if (!this.isAuthenticated) {
      console.log('User not authenticated, skipping audio playback');
      return;
    }

    if (sound) {
      const audio = new Audio();
      audio.src = sound.sound_file;
      audio.load();
      audio.play();
    }
  }

  public cleanup(): void {
    console.log('Cleaning up Pusher service...');

    // Unsubscribe from channel if it exists
    if (this.backOfficeChannel) {
      try {
        this.backOfficeChannel.unbind_all();
        this.backOfficeChannel.unsubscribe();
        this.backOfficeChannel = null;
      } catch (error) {
        console.warn('Error unsubscribing from Pusher channel:', error);
      }
    }

    // Disconnect Pusher if it exists
    if (this.pusher) {
      try {
        this.pusher.disconnect();
        this.pusher = null;
      } catch (error) {
        console.warn('Error disconnecting Pusher:', error);
      }
    }

    // Reset authentication data
    this.isAuthenticated = false;
    this.userToken = null;
    this.userId = null;

    console.log('Pusher service cleaned up successfully');
  }
}
