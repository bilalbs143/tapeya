/**
 * Native HLS only on iOS WKWebView.
 * Android Chromium often false-positives canPlayType — never use this check there.
 */

import { getPlatform } from '@/shared/platform/platform';

export function canPlayNativeHls(video: HTMLVideoElement): boolean {
  if (getPlatform() !== 'ios') return false;
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
}
