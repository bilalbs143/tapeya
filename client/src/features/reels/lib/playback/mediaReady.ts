/** Wait until the element can paint / decode (HAVE_CURRENT_DATA+). */
export function waitForMediaReady(video: HTMLVideoElement, then: () => void): () => void {
  if (video.readyState >= 2) {
    then();
    return () => {};
  }

  const onReady = () => {
    cleanup();
    then();
  };

  video.addEventListener('loadeddata', onReady);
  video.addEventListener('canplay', onReady);

  const cleanup = () => {
    video.removeEventListener('loadeddata', onReady);
    video.removeEventListener('canplay', onReady);
  };

  return cleanup;
}
