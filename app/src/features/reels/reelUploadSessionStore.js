import { useSyncExternalStore } from 'react';

import { baseApi } from '@/store/api/baseApi';
import { publishReel } from '@/store/api/reelsApi';
import { store } from '@/store/store';

/**
 * In-flight reel upload session (module store).
 * Survives navigation away from /reels/upload so a floating chip can show progress.
 *
 * @typedef {'idle' | 'uploading' | 'success' | 'error'} ReelUploadStatus
 * @typedef {{
 *   status: ReelUploadStatus,
 *   percent: number,
 *   stage: string,
 *   previewUrl: string | null,
 *   error: string | null,
 * }} ReelUploadSession
 */

/** @type {ReelUploadSession} */
const IDLE = {
  status: 'idle',
  percent: 0,
  stage: 'preparing',
  previewUrl: null,
  error: null,
};

/** @type {ReelUploadSession} */
let session = { ...IDLE };
const listeners = new Set();
let clearTimer = null;
let beforeUnloadAttached = false;
/** Object URL owned by the session (revoked on clear). */
let ownedPreviewUrl = null;
/** Bumps on each start/clear so late async completions cannot resurrect a cleared session. */
let uploadGeneration = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function setSession(patch) {
  session = { ...session, ...patch };
  emit();
}

function attachBeforeUnload() {
  if (beforeUnloadAttached || typeof window === 'undefined') return;
  beforeUnloadAttached = true;
  window.addEventListener('beforeunload', onBeforeUnload);
}

function detachBeforeUnload() {
  if (!beforeUnloadAttached || typeof window === 'undefined') return;
  beforeUnloadAttached = false;
  window.removeEventListener('beforeunload', onBeforeUnload);
}

function onBeforeUnload(event) {
  if (session.status !== 'uploading') return;
  event.preventDefault();
  event.returnValue = '';
}

function revokeOwnedPreview() {
  if (ownedPreviewUrl) {
    URL.revokeObjectURL(ownedPreviewUrl);
    ownedPreviewUrl = null;
  }
}

function cancelClearTimer() {
  if (!clearTimer) return;
  clearTimeout(clearTimer);
  clearTimer = null;
}

/**
 * Clear session state. Revokes preview object URL if we own it.
 * Invalidates any in-flight upload completion for the previous generation.
 */
export function clearReelUploadSession() {
  cancelClearTimer();
  uploadGeneration += 1;
  detachBeforeUnload();
  revokeOwnedPreview();
  session = { ...IDLE };
  emit();
}

export function getReelUploadSession() {
  return session;
}

export function subscribeReelUploadSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReelUploadSession() {
  return useSyncExternalStore(subscribeReelUploadSession, getReelUploadSession, () => IDLE);
}

function isCurrentGeneration(generation) {
  return generation === uploadGeneration;
}

/**
 * Start a background reel upload. Navigating away is safe — progress lives here.
 *
 * @param {{
 *   file: File,
 *   caption?: string,
 *   visibility?: string,
 *   clientDurationMs?: number,
 *   previewUrl?: string | null,
 *   mutations: {
 *     createReel: Function,
 *     uploadMedia: Function,
 *     initMultipart?: Function,
 *     uploadPart?: Function,
 *     completeMultipart?: Function,
 *     abortMultipart?: Function,
 *   },
 * }} opts
 * @returns {boolean} false if an upload is already in progress
 */
export function startReelUpload(opts) {
  if (session.status === 'uploading') {
    return false;
  }

  const { file, caption, visibility, clientDurationMs, previewUrl, mutations } = opts;
  if (!file || !mutations?.createReel) {
    return false;
  }

  cancelClearTimer();
  uploadGeneration += 1;
  const generation = uploadGeneration;

  // Take ownership of the preview URL so UploadReels can reset without revoking it.
  revokeOwnedPreview();
  ownedPreviewUrl = previewUrl || null;

  setSession({
    status: 'uploading',
    percent: 0,
    stage: 'preparing',
    previewUrl: ownedPreviewUrl,
    error: null,
  });
  attachBeforeUnload();

  void (async () => {
    try {
      await publishReel(mutations, {
        file,
        caption,
        visibility,
        clientDurationMs,
        onProgress: ({ stage, percent }) => {
          if (!isCurrentGeneration(generation) || session.status !== 'uploading') return;
          setSession({
            stage: typeof stage === 'string' ? stage : session.stage,
            percent: Number.isFinite(percent) ? percent : session.percent,
          });
        },
      });

      if (!isCurrentGeneration(generation)) return;

      try {
        store.dispatch(
          baseApi.util.invalidateTags([
            { type: 'Reel', id: 'MINE' },
            { type: 'Reel', id: 'FEED' },
          ]),
        );
      } catch {
        // Upload already succeeded — do not surface cache invalidation failures as upload errors.
      }

      setSession({
        status: 'success',
        percent: 100,
        stage: 'finishing',
        error: null,
      });
      detachBeforeUnload();

      clearTimer = setTimeout(() => {
        clearTimer = null;
        if (!isCurrentGeneration(generation)) return;
        clearReelUploadSession();
      }, 1500);
    } catch (err) {
      if (!isCurrentGeneration(generation)) return;

      const message = err?.data?.message || err?.error || err?.message || 'Could not publish reel. Please try again.';
      setSession({
        status: 'error',
        error: typeof message === 'string' ? message : 'Could not publish reel. Please try again.',
      });
      detachBeforeUnload();
    }
  })();

  return true;
}
