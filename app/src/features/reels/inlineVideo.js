/**
 * Keep reel `<video>` inline on iOS WKWebView + Android WebView.
 * Without `webkit-playsinline`, iOS can promote AVPlayer above the WebView and
 * swallow all taps (back / tabs / bottom nav look frozen).
 *
 * @param {HTMLVideoElement|null|undefined} video
 */
export function applyInlineVideoAttributes(video) {
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
