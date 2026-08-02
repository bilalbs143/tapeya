/**
 * Mobile-first reel video accept rules (Android Camera + iOS Camera Roll).
 */

/** @type {readonly string[]} */
export const REEL_VIDEO_EXTENSIONS = Object.freeze(['mp4', 'mov', 'm4v', 'webm', '3gp', '3gpp']);

/** @type {readonly string[]} */
export const REEL_VIDEO_MIMES = Object.freeze([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'video/3gpp',
  'video/3gpp2',
  'video/hevc',
  'video/h265',
]);

/** Value for `<input type="file" accept="…">` — prefers gallery/camera on phones. */
export const REEL_VIDEO_ACCEPT = ['video/*', '.mp4', '.mov', '.m4v', '.webm', '.3gp', '.3gpp', ...REEL_VIDEO_MIMES].join(',');

/**
 * @param {string | undefined | null} filename
 */
export function reelVideoExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const match = /\.([a-z0-9]+)$/i.exec(filename.trim());
  return match ? match[1].toLowerCase() : '';
}

/**
 * True for typical phone-recorded reels. Empty MIME (common on iOS/Capacitor) falls back to extension.
 * @param {File | Blob & { name?: string, type?: string }} file
 */
export function isAllowedReelVideoFile(file) {
  if (!file) return false;

  const mime = String(file.type || '')
    .toLowerCase()
    .trim();
  const ext = reelVideoExtension(file.name);

  if (REEL_VIDEO_MIMES.includes(mime)) {
    return true;
  }

  if (mime.startsWith('video/') && REEL_VIDEO_EXTENSIONS.includes(ext)) {
    return true;
  }

  // Gallery / WebView often omit type for .mov / .mp4
  if ((!mime || mime === 'application/octet-stream') && REEL_VIDEO_EXTENSIONS.includes(ext)) {
    return true;
  }

  // Last resort: browser reports video/* with no usable name (camera capture)
  if (mime.startsWith('video/') && !ext) {
    return true;
  }

  return false;
}

/**
 * @param {number} maxUploadMb
 * @returns {string|null}
 */
export function formatReelMaxUploadLabel(maxUploadMb) {
  const mb = Number(maxUploadMb);
  if (!Number.isFinite(mb) || mb <= 0) return null;
  return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

/**
 * @param {File | Blob} file
 * @returns {Promise<number|null>} duration in seconds
 */
export function probeReelVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(duration) ? duration : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read video metadata.'));
    };
    video.src = url;
  });
}

/**
 * Client-side gate before preview / publish. Server remains source of truth.
 *
 * @param {File} file
 * @param {{ maxUploadMb?: number, maxDurationSeconds?: number, minDurationSeconds?: number }} [limits]
 * @returns {Promise<{ ok: true, durationSec: number|null } | { ok: false, error: string }>}
 */
export async function validateReelVideoForUpload(file, limits = {}) {
  if (!isAllowedReelVideoFile(file)) {
    return {
      ok: false,
      error: 'Please choose a phone video (MP4, MOV, M4V, WebM, or 3GP).',
    };
  }

  const maxUploadMb = Number(limits.maxUploadMb) || 0;
  if (maxUploadMb > 0 && file.size > maxUploadMb * 1024 * 1024) {
    const label = formatReelMaxUploadLabel(maxUploadMb);
    return {
      ok: false,
      error: label ? `Video is too large. Max size is ${label}.` : 'Video is too large.',
    };
  }

  const maxDurationSeconds = Number(limits.maxDurationSeconds) || 0;
  const minDurationSeconds = Number(limits.minDurationSeconds) || 0;
  let durationSec = null;

  if (maxDurationSeconds > 0 || minDurationSeconds > 0) {
    try {
      durationSec = await probeReelVideoDuration(file);
    } catch {
      // Metadata unreadable — let server/transcode decide.
      return { ok: true, durationSec: null };
    }

    if (durationSec != null) {
      if (minDurationSeconds > 0 && durationSec < minDurationSeconds) {
        return {
          ok: false,
          error: `Video is too short. Minimum length is ${minDurationSeconds}s.`,
        };
      }
      if (maxDurationSeconds > 0 && durationSec > maxDurationSeconds + 0.5) {
        return {
          ok: false,
          error: `Video is too long. Maximum length is ${maxDurationSeconds}s.`,
        };
      }
    }
  }

  return { ok: true, durationSec };
}
