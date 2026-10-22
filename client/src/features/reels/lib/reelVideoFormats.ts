/** Reel upload — allowed extensions/MIME and client validation. */

export const REEL_VIDEO_EXTENSIONS = Object.freeze(['mp4', 'mov', 'm4v', 'webm', '3gp', '3gpp'] as const);

export const REEL_VIDEO_MIMES = Object.freeze([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'video/3gpp',
  'video/3gpp2',
  'video/hevc',
  'video/h265',
] as const);

/** Value for `<input type="file" accept="…">` — prefers gallery/camera on phones. */
export const REEL_VIDEO_ACCEPT = [
  'video/*',
  '.mp4',
  '.mov',
  '.m4v',
  '.webm',
  '.3gp',
  '.3gpp',
  ...REEL_VIDEO_MIMES,
].join(',');

export function reelVideoExtension(filename: string | null | undefined): string {
  if (!filename || typeof filename !== 'string') return '';
  const match = /\.([a-z0-9]+)$/i.exec(filename.trim());
  return match?.[1]?.toLowerCase() ?? '';
}

export function isAllowedReelVideoFile(file: File | (Blob & { name?: string; type?: string }) | null): boolean {
  if (!file) return false;

  const mime = String(file.type || '')
    .toLowerCase()
    .trim();
  const ext = reelVideoExtension('name' in file ? file.name : undefined);

  if ((REEL_VIDEO_MIMES as readonly string[]).includes(mime)) return true;
  if (mime.startsWith('video/') && (REEL_VIDEO_EXTENSIONS as readonly string[]).includes(ext)) return true;
  if ((!mime || mime === 'application/octet-stream') && (REEL_VIDEO_EXTENSIONS as readonly string[]).includes(ext)) {
    return true;
  }
  if (mime.startsWith('video/') && !ext) return true;
  return false;
}

export function formatReelMaxUploadLabel(maxUploadMb: number): string | null {
  const mb = Number(maxUploadMb);
  if (!Number.isFinite(mb) || mb <= 0) return null;
  return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

export function probeReelVideoDuration(file: File | Blob): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const release = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const { duration } = video;
      release();
      resolve(Number.isFinite(duration) ? duration : null);
    };
    video.onerror = () => {
      release();
      reject(new Error('Could not read video metadata.'));
    };
    video.src = url;
  });
}

export type ReelUploadLimits = {
  maxUploadMb?: number | undefined;
  maxDurationSeconds?: number | undefined;
  minDurationSeconds?: number | undefined;
};

export type ReelValidateOk = { ok: true; durationSec: number | null };
export type ReelValidateFail = { ok: false; error: string };
export type ReelValidateResult = ReelValidateOk | ReelValidateFail;

export async function validateReelVideoForUpload(
  file: File,
  limits: ReelUploadLimits = {}
): Promise<ReelValidateResult> {
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
  let durationSec: number | null = null;

  if (maxDurationSeconds > 0 || minDurationSeconds > 0) {
    try {
      durationSec = await probeReelVideoDuration(file);
    } catch {
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
