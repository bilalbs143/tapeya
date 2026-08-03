/**
 * Silent client-side reel poster extraction (provisional JPEG).
 * Seek rules mirror api/app/Services/Post/PostPosterService.php.
 */

const MAX_EDGE = 1080;
const JPEG_QUALITY = 0.82;
const EXTRACT_TIMEOUT_MS = 8000;

/**
 * Poster seek time in seconds — same clamps as server FFmpeg extract.
 *
 * @param {number|null|undefined} durationSec
 * @returns {number}
 */
export function reelPosterSeekSeconds(durationSec) {
  const durationMs = Number(durationSec) * 1000;
  if (Number.isFinite(durationMs) && durationMs > 2000) {
    return Math.min(Math.max((durationMs / 1000) * 0.1, 0.5), 5.0);
  }
  return 1.0;
}

/**
 * @param {number} width
 * @param {number} height
 * @param {number} [maxEdge]
 * @returns {{ width: number, height: number }}
 */
export function fitReelPosterDimensions(width, height, maxEdge = MAX_EDGE) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
    return { width: 1, height: 1 };
  }
  const longest = Math.max(w, h);
  const scale = longest > maxEdge ? maxEdge / longest : 1;

  return {
    width: Math.max(2, Math.round((w * scale) / 2) * 2),
    height: Math.max(2, Math.round((h * scale) / 2) * 2),
  };
}

/**
 * Extract a single JPEG frame from a local video File. Best-effort — returns null on failure.
 *
 * @param {File|Blob} file
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<Blob|null>}
 */
export function extractReelPosterJpeg(file, options = {}) {
  if (typeof document === 'undefined' || !file) {
    return Promise.resolve(null);
  }

  const timeoutMs = options.timeoutMs ?? EXTRACT_TIMEOUT_MS;

  return new Promise((resolve) => {
    let settled = false;
    let objectUrl = null;
    let seekStarted = false;
    /** @type {HTMLVideoElement|null} */
    let video = null;
    /** @type {ReturnType<typeof setTimeout>|null} */
    let timer = null;
    /** @type {ReturnType<typeof setTimeout>|null} */
    let seekFallbackTimer = null;

    const finish = (blob) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (seekFallbackTimer) clearTimeout(seekFallbackTimer);
      if (video) {
        video.onloadedmetadata = null;
        video.onloadeddata = null;
        video.onseeked = null;
        video.onerror = null;
        video.removeAttribute('src');
        video.load();
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(blob);
    };

    timer = setTimeout(() => finish(null), timeoutMs);

    try {
      video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.preload = 'auto';
      objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onerror = () => finish(null);

      const captureFrame = () => {
        if (settled || !video) return;
        try {
          const srcW = video.videoWidth || 0;
          const srcH = video.videoHeight || 0;
          if (srcW < 1 || srcH < 1) {
            finish(null);
            return;
          }
          const { width, height } = fitReelPosterDimensions(srcW, srcH);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            finish(null);
            return;
          }
          ctx.drawImage(video, 0, 0, width, height);
          canvas.toBlob((blob) => finish(blob && blob.size > 0 ? blob : null), 'image/jpeg', JPEG_QUALITY);
        } catch {
          finish(null);
        }
      };

      const seekToPoster = () => {
        if (settled || !video || seekStarted) return;
        seekStarted = true;
        const duration = Number(video.duration);
        const seek = reelPosterSeekSeconds(Number.isFinite(duration) ? duration : null);
        const maxSeek = Number.isFinite(duration) && duration > 0 ? Math.max(0, duration - 0.05) : seek;
        const target = Math.min(seek, maxSeek);
        try {
          // Some engines skip seeked when already at the target; capture directly.
          if (Math.abs(video.currentTime - target) < 0.05 && video.videoWidth > 0) {
            captureFrame();
            return;
          }
          video.currentTime = target;
          // Fallback if seeked never fires (odd codecs / short clips).
          seekFallbackTimer = setTimeout(() => {
            if (!settled && video && video.videoWidth > 0) {
              captureFrame();
            }
          }, 1500);
        } catch {
          finish(null);
        }
      };

      video.onseeked = captureFrame;
      video.onloadedmetadata = seekToPoster;
      // iOS sometimes exposes dimensions only after loadeddata.
      video.onloadeddata = seekToPoster;
    } catch {
      finish(null);
    }
  });
}

/**
 * Await a poster promise briefly; resolve null if still pending.
 *
 * @param {Promise<Blob|null>|null|undefined} posterPromise
 * @param {number} [waitMs]
 * @returns {Promise<Blob|null>}
 */
export async function awaitReelPosterBriefly(posterPromise, waitMs = 2000) {
  if (!posterPromise) return null;
  let timeoutId;
  try {
    return await Promise.race([
      posterPromise.then((blob) => blob ?? null).catch(() => null),
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(null), waitMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
