/**
 * Multipart reel part upload with byte progress (XHR).
 * fetch() cannot report upload progress — that was the 10%→94% jump.
 */

import { baseUrl } from '@/lib/apiOrigin';

/**
 * @param {{
 *   reelId: number|string,
 *   uploadId: string,
 *   partNumber: number,
 *   file: Blob,
 *   accessToken?: string | null,
 *   onUploadProgress?: (loadedBytes: number) => void,
 * }} opts
 */
export function uploadReelPartWithProgress({ reelId, uploadId, partNumber, file, accessToken = null, onUploadProgress = null }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('upload_id', uploadId);
    body.append('part_number', String(partNumber));
    body.append('file', file, file instanceof File && file.name ? file.name : `part-${partNumber}`);

    xhr.upload.onprogress = (event) => {
      if (!onUploadProgress) return;
      const loaded = event.lengthComputable ? event.loaded : Math.min(event.loaded || 0, file.size);
      onUploadProgress(loaded);
    };

    xhr.onload = () => {
      let payload = null;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        payload = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload?.data ?? payload ?? {});
        return;
      }
      const err = new Error(payload?.message || `Upload failed (${xhr.status})`);
      err.status = xhr.status;
      err.data = payload;
      reject(err);
    };
    xhr.onerror = () => {
      const err = new Error('Network error');
      err.status = 'FETCH_ERROR';
      reject(err);
    };
    xhr.ontimeout = () => {
      const err = new Error('Upload timed out');
      err.status = 'TIMEOUT_ERROR';
      reject(err);
    };

    xhr.open('POST', `${baseUrl}/reels/${reelId}/upload/part`);
    xhr.timeout = 180_000;
    xhr.setRequestHeader('Accept', 'application/json');
    if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.send(body);
  });
}
