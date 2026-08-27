import { useSyncExternalStore } from 'react';

import { baseApi } from '@/store/api/baseApi';
import { publishReel } from '@/store/api/reelsApi';
import { store } from '@/store/store';

/**
 * In-flight reel upload session (module store).
 * Survives navigation away from /reels/upload so the blocking progress dialog can stay open.
 *
 * @typedef {'idle' | 'uploading' | 'success' | 'error'} ReelUploadStatus
 * @typedef {{
 *   status: ReelUploadStatus,
 *   percent: number,
 *   stage: string,
 *   previewUrl: string | null,
 *   error: string | null,
 *   reelId: number | null,
 * }} ReelUploadSession
 */

/** @type {ReelUploadSession} */
const IDLE = {
  status: 'idle',
  percent: 0,
  stage: 'preparing',
  previewUrl: null,
  error: null,
  reelId: null,
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

/** How long the success state stays visible in the blocking dialog before auto-dismiss. */
export const REEL_UPLOAD_SUCCESS_CLEAR_MS = 2200;

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
 * Start a reel upload. Progress lives in this session so the blocking dialog can stay open.
 *
 * @param {{
 *   file: File,
 *   caption?: string,
 *   visibility?: string,
 *   clientDurationMs?: number,
 *   previewUrl?: string | null,
 *   posterBlob?: Blob | File | null,
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

  const { file, caption, visibility, clientDurationMs, previewUrl, posterBlob, mutations } = opts;
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
    reelId: null,
  });
  attachBeforeUnload();

  void (async () => {
    try {
      const created = await publishReel(mutations, {
        file,
        caption,
        visibility,
        clientDurationMs,
        posterBlob: posterBlob || null,
        onProgress: ({ stage, percent }) => {
          if (!isCurrentGeneration(generation) || session.status !== 'uploading') return;
          setSession({
            stage: typeof stage === 'string' ? stage : session.stage,
            percent: Number.isFinite(percent) ? percent : session.percent,
          });
        },
      });

      if (!isCurrentGeneration(generation)) return;

      const reelId = Number(created?.id);
      const nextReelId = Number.isFinite(reelId) && reelId > 0 ? reelId : null;

      try {
        store.dispatch(
          baseApi.util.invalidateTags([
            { type: 'Reel', id: 'MINE' },
            { type: 'Reel', id: 'FEED' },
            ...(nextReelId ? [{ type: 'Reel', id: nextReelId }] : []),
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
        reelId: nextReelId,
      });
      detachBeforeUnload();

      clearTimer = setTimeout(() => {
        clearTimer = null;
        if (!isCurrentGeneration(generation)) return;
        clearReelUploadSession();
      }, REEL_UPLOAD_SUCCESS_CLEAR_MS);
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
