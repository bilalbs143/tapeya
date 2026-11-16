/** Shared reel playback contracts — platform modules stay independent. */

export type ReelAttachRole = 'active' | 'next';

export type ReelPlaybackMode = 'hls' | 'progressive';

export type ReelPlaybackSource = {
  url?: string | null | undefined;
  type?: string | null | undefined;
  hlsUrl?: string | null | undefined;
};

export type ResolvedPlayback = {
  url: string | null;
  mode: ReelPlaybackMode | null;
};

export type ReelPlaybackPlatform = 'ios' | 'android' | 'web';
