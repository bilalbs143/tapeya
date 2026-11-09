/** Keep reel `<video>` inline on iOS WKWebView + Android WebView. Without `webkit-playsinline`, iOS can promote AVPlayer above the WebView. */
export function applyInlineVideoAttributes(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;

  video.playsInline = true;
  video.controls = false;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  if ('disablePictureInPicture' in video) {
    video.disablePictureInPicture = true;
  }
  video.setAttribute('disablepictureinpicture', '');
}

/** Property + attribute must agree or WebViews can keep leaking audio after swipe. */
export function setReelVideoMuted(video: HTMLVideoElement, muted: boolean): void {
  video.muted = muted;
  video.defaultMuted = muted;
  if (muted) video.setAttribute('muted', '');
  else video.removeAttribute('muted');
}

/**
 * Stop a demoted reel hard. Android Chromium/WebView often keeps decoding audio after
 * mute+pause alone — volume 0 closes that path. Call {@link armReelVideoAudio} before
 * audible play on the new active slide.
 */
export function stopReelVideo(video: HTMLVideoElement): void {
  setReelVideoMuted(video, true);
  try {
    video.volume = 0;
  } catch {
    // Ignore.
  }
  try {
    video.pause();
  } catch {
    // Ignore.
  }
}

/** Restore audible level after {@link stopReelVideo} (safe on iOS too). */
export function armReelVideoAudio(video: HTMLVideoElement): void {
  try {
    video.volume = 1;
  } catch {
    // Ignore.
  }
}
