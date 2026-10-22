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
