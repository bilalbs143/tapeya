import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioNotificationService {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private userHasInteracted: boolean = false;
  private audioInitialized: boolean = false;
  private pendingAudioQueue: Array<{ src: string; volume?: number }> = [];
  private isAudioSupported: boolean = true;
  private audioContextInitialized: boolean = false;
  private useAudioContext: boolean = false;
  private initializationAttempts: number = 0;
  private maxInitializationAttempts: number = 5;
  private isAuthenticated: boolean = true; // Default to true, will be updated by AuthService

  constructor() {
    this.checkAudioSupport();
    // Try to initialize audio element immediately
    this.initializeAudioElement();

    // Also try after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (!this.audio) {
        this.initializeAudioElement();
      }
    }, 100);
  }

  private checkAudioSupport(): void {
    try {
      // Check if audio is supported
      const testAudio = new Audio();
      this.isAudioSupported = !!(testAudio.canPlayType && testAudio.canPlayType('audio/mpeg'));
    } catch {
      console.warn('Audio not supported in this browser');
      this.isAudioSupported = false;
    }
  }

  private initializeAudioElement(): void {
    if (!this.isAudioSupported || this.initializationAttempts >= this.maxInitializationAttempts) {
      return;
    }

    this.initializationAttempts++;

    try {
      // Try to get the global audio element
      this.audio = document.getElementById('globalNotificationSound') as HTMLAudioElement;

      // If global audio element not found, create a new one
      if (!this.audio) {
        console.warn(`Global audio element not found (attempt ${this.initializationAttempts}), creating a new one`);
        this.audio = document.createElement('audio');
        this.audio.id = 'fallbackNotificationSound';
        this.audio.preload = 'auto';
        this.audio.volume = 0.7;
        document.body.appendChild(this.audio);
        console.log('Fallback audio element created and added to DOM');
      } else {
        // Set audio properties for existing element
        this.audio.preload = 'auto';
        this.audio.volume = 0.7;
        console.log('Global audio element initialized successfully');
      }
    } catch (error) {
      console.warn(`Audio element initialization failed (attempt ${this.initializationAttempts}):`, error);

      // If this is not the last attempt, try again after a delay
      if (this.initializationAttempts < this.maxInitializationAttempts) {
        setTimeout(() => {
          this.initializeAudioElement();
        }, 200 * this.initializationAttempts); // Exponential backoff
      } else {
        this.isAudioSupported = false;
      }
    }
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.audioContextInitialized || !this.isAudioSupported || this.useAudioContext) {
      return;
    }

    try {
      // Create AudioContext only after user interaction
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Check if the context is suspended and resume it
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create a silent buffer to unlock audio
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);

      this.audioContextInitialized = true;
      this.useAudioContext = true;
      console.log('AudioContext initialized successfully');
    } catch (error) {
      console.warn('AudioContext initialization failed, falling back to HTML5 audio:', error);
      this.useAudioContext = false;
      // Don't disable audio support, just don't use AudioContext
    }
  }

  public async handleUserInteraction(): Promise<void> {
    if (!this.userHasInteracted) {
      this.userHasInteracted = true;

      // Ensure audio element is initialized
      if (!this.audio) {
        this.initializeAudioElement();
      }

      // Try to initialize AudioContext after user interaction
      try {
        await this.initializeAudioContext();
      } catch (error) {
        console.warn('AudioContext initialization failed, continuing with HTML5 audio:', error);
      }

      // Play any pending audio
      await this.playPendingAudio();
    }
  }

  private async playPendingAudio(): Promise<void> {
    while (this.pendingAudioQueue.length > 0) {
      const audioData = this.pendingAudioQueue.shift();
      if (audioData) {
        try {
          await this.playSound(audioData.src, audioData.volume);
        } catch (error) {
          console.warn('Failed to play queued audio:', error);
        }
      }
    }
  }

  public async playSound(audioSrc: string, volume: number = 0.7): Promise<void> {
    // Check if user is authenticated before playing audio
    if (!this.isAuthenticated) {
      console.log('User not authenticated, skipping audio playback');
      return;
    }

    if (!this.isAudioSupported) {
      console.log('Audio not supported, skipping sound playback');
      return;
    }

    // Ensure audio element is available
    if (!this.audio) {
      this.initializeAudioElement();
      if (!this.audio) {
        console.warn('Audio element not available after initialization attempt');
        return;
      }
    }

    if (!this.userHasInteracted) {
      // Store in queue for later playback
      this.pendingAudioQueue.push({ src: audioSrc, volume });
      console.log('Audio queued for playback after user interaction');
      return;
    }

    try {
      // Try HTML5 audio first (more reliable)
      await this.playWithHTML5Audio(audioSrc, volume);
    } catch (error) {
      console.warn('HTML5 audio failed, trying AudioContext:', error);
      try {
        await this.playWithAudioContext(audioSrc, volume);
      } catch (audioContextError) {
        console.warn('Both HTML5 audio and AudioContext failed:', audioContextError);
        throw audioContextError;
      }
    }
  }

  private async playWithHTML5Audio(audioSrc: string, volume: number): Promise<void> {
    if (!this.audio) {
      throw new Error('Audio element not available');
    }

    // Set the audio source and properties
    this.audio.src = audioSrc;
    this.audio.volume = volume;
    this.audio.load();

    // Play the audio
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      console.log('HTML5 audio played successfully');
    }
  }

  private async playWithAudioContext(audioSrc: string, volume: number): Promise<void> {
    // Ensure AudioContext is ready
    if (!this.audioContextInitialized) {
      await this.initializeAudioContext();
    }

    // Ensure audio context is resumed
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // For now, fall back to HTML5 audio even with AudioContext
    // AudioContext is mainly used for unlocking audio capabilities
    await this.playWithHTML5Audio(audioSrc, volume);
  }

  public cleanup(): void {
    console.log('Cleaning up audio notification service...');

    // Stop any currently playing audio
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }

    // Close AudioContext if it exists
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.warn('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }

    // Clear pending audio queue
    this.pendingAudioQueue = [];

    // Reset all state
    this.userHasInteracted = false;
    this.audioInitialized = false;
    this.audioContextInitialized = false;
    this.useAudioContext = false;
    this.initializationAttempts = 0;
    this.isAuthenticated = false; // Mark as not authenticated after cleanup

    // Remove fallback audio element if it exists
    const fallbackAudio = document.getElementById('fallbackNotificationSound');
    if (fallbackAudio) {
      fallbackAudio.remove();
    }

    console.log('Audio notification service cleaned up successfully');
  }

  public setAuthenticationStatus(isAuthenticated: boolean): void {
    this.isAuthenticated = isAuthenticated;
  }

  public isAudioAvailable(): boolean {
    return this.audio !== null && this.userHasInteracted && this.isAudioSupported && this.isAuthenticated;
  }

  public getUserInteractionStatus(): boolean {
    return this.userHasInteracted;
  }

  public getAudioSupportStatus(): boolean {
    return this.isAudioSupported;
  }

  public getPendingAudioCount(): number {
    return this.pendingAudioQueue.length;
  }

  public getAudioContextStatus(): string | null {
    return this.audioContext ? this.audioContext.state : null;
  }

  public getAudioElementStatus(): string {
    if (!this.audio) return 'Not available';
    return this.audio.id || 'Available (no ID)';
  }

  public getInitializationAttempts(): number {
    return this.initializationAttempts;
  }
}
