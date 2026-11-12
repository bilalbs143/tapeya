import { type PluginListenerHandle, registerPlugin } from '@capacitor/core';

import { getPlatform, isNativePlatform } from '@/shared/platform/platform';

/** iOS-only native YouTube WKWebView overlay — no-op on web/Android. */

export type YoutubeOverlayLayout = {
  x?: number | undefined;
  y?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  /** Below Capacitor so React chrome stays tappable. */
  underlay?: boolean | undefined;
  /** Native WKWebView receives taps (YouTube controls). */
  userInteractionEnabled?: boolean | undefined;
  /** Fill host window — Full landscape (embed rotate/cover). */
  immersiveFullscreen?: boolean | undefined;
  updateFrame?: boolean | undefined;
};

export type YoutubeOverlayShowOptions = YoutubeOverlayLayout & {
  url: string;
  reload?: boolean | undefined;
};

type YoutubeStreamOverlayPlugin = {
  show: (options: YoutubeOverlayShowOptions) => Promise<{ shown: boolean; reason?: string }>;
  updateLayout: (options: YoutubeOverlayLayout & { url?: string }) => Promise<{ updated: boolean; reason?: string }>;
  hide: () => Promise<{ hidden: boolean }>;
  getReadyState: () => Promise<{ ready: boolean }>;
  addListener: (
    event: 'playerReady' | 'playerPlaying' | 'playerError' | 'exitImmersive',
    callback: () => void
  ) => Promise<PluginListenerHandle>;
};

const YoutubeStreamOverlay = registerPlugin<YoutubeStreamOverlayPlugin>('YoutubeStreamOverlay');

/** Serialises native overlay calls so hide always completes before the next show. */
let overlayGate = Promise.resolve();

function enqueueOverlay<T>(task: () => Promise<T>): Promise<T> {
  const run = overlayGate.then(task);
  overlayGate = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/** True only on iOS Capacitor — in-DOM YouTube iframe does not reliably reach PLAYING. */
export function usesIosNativeYoutubePlayer(): boolean {
  return isNativePlatform() && getPlatform() === 'ios';
}

/** Full on iOS native YouTube — ImmersiveLandscapeStage uses native Exit + transparent stage. */
export function isIosNativeYoutubeLandscape(active: boolean): boolean {
  return usesIosNativeYoutubePlayer() && active;
}

export async function showYoutubeStreamOverlay(
  options: YoutubeOverlayShowOptions
): Promise<{ shown: boolean; reason?: string }> {
  if (!usesIosNativeYoutubePlayer()) return { shown: false };
  return enqueueOverlay(() => YoutubeStreamOverlay.show(options));
}

export async function updateYoutubeStreamOverlayLayout(
  layout: YoutubeOverlayLayout & { url?: string }
): Promise<{ updated: boolean; reason?: string }> {
  if (!usesIosNativeYoutubePlayer()) return { updated: false };
  return enqueueOverlay(() => YoutubeStreamOverlay.updateLayout(layout));
}

export async function hideYoutubeStreamOverlay(): Promise<{ hidden: boolean }> {
  if (!usesIosNativeYoutubePlayer()) return { hidden: false };
  return enqueueOverlay(() => YoutubeStreamOverlay.hide());
}

export async function getYoutubeStreamPlayerReadyState(): Promise<{ ready: boolean }> {
  if (!usesIosNativeYoutubePlayer()) return { ready: false };
  return YoutubeStreamOverlay.getReadyState();
}

function onYoutubeStreamEvent(
  event: 'playerReady' | 'playerPlaying' | 'playerError' | 'exitImmersive',
  callback: () => void
): Promise<PluginListenerHandle> | { remove: () => void } {
  if (!usesIosNativeYoutubePlayer()) return { remove: () => {} };
  return YoutubeStreamOverlay.addListener(event, callback);
}

export const onYoutubeStreamPlayerReady = (cb: () => void) => onYoutubeStreamEvent('playerReady', cb);
export const onYoutubeStreamPlayerPlaying = (cb: () => void) => onYoutubeStreamEvent('playerPlaying', cb);
export const onYoutubeStreamPlayerError = (cb: () => void) => onYoutubeStreamEvent('playerError', cb);
/** Native Exit control on iOS YouTube Full. */
export const onYoutubeStreamExitImmersive = (cb: () => void) => onYoutubeStreamEvent('exitImmersive', cb);
