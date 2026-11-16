/** Shared progressive `<video src>` attach used by every platform. */
export function attachProgressiveSource(
  video: HTMLVideoElement,
  url: string,
  onReady: () => void,
  onError: () => void
): () => void {
  const onLoaded = () => onReady();
  video.addEventListener('error', onError);
  video.addEventListener('loadeddata', onLoaded, { once: true });
  video.src = url;

  return () => {
    video.removeEventListener('error', onError);
    video.removeEventListener('loadeddata', onLoaded);
  };
}
