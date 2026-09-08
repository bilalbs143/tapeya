/**
 * Capture a JPEG still from a decoded `<video>` (upload preview thumb).
 */

const MAX_EDGE = 1080;
const JPEG_QUALITY = 0.82;

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
 * @param {HTMLVideoElement|null|undefined} video
 * @returns {Promise<Blob|null>}
 */
export function captureHtmlVideoFrameJpeg(video) {
  if (typeof document === 'undefined' || !video) {
    return Promise.resolve(null);
  }

  const srcW = video.videoWidth || 0;
  const srcH = video.videoHeight || 0;
  if (srcW < 1 || srcH < 1 || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve(null);
  }

  try {
    const { width, height } = fitReelPosterDimensions(srcW, srcH);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);
    ctx.drawImage(video, 0, 0, width, height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob && blob.size > 0 ? blob : null), 'image/jpeg', JPEG_QUALITY);
    });
  } catch {
    return Promise.resolve(null);
  }
}
