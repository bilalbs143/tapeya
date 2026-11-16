/** Tear down `<video>` media for a clean re-attach. */
export function hardResetVideo(video: HTMLVideoElement): void {
  try {
    video.pause();
  } catch {
    // Ignore.
  }
  video.removeAttribute('src');
  try {
    video.srcObject = null;
  } catch {
    // Ignore.
  }
  try {
    video.load();
  } catch {
    // Ignore load() on detached nodes.
  }
}
