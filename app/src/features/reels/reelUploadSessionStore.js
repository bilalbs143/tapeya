import { useSyncExternalStore } from 'react';

import { rememberClientReelPoster, rememberClientReelVideo } from '@/features/reels/clientReelPoster';
import { baseApi } from '@/store/api/baseApi';
import { publishReel } from '@/store/api/reelsApi';
import { store } from '@/store/store';

/**
 * In-flight reel upload session (module store).
 *
 * @typedef {'idle' | 'uploading' | 'success' | 'error'} ReelUploadStatus
 * @typedef {{
 *   status: ReelUploadStatus,
 *   percent: number,
 *   stage: string,
 *   posterUrl: string | null,
 *   error: string | null,
 *   reelId: number | null,
 * }} ReelUploadSession
 */

/** @type {ReelUploadSession} */
const IDLE = {
  status: 'idle',
  percent: 0,
  stage: 'preparing',
  posterUrl: null,
  error: null,
  reelId: null,
};

/** @type {ReelUploadSession} */
let session = { ...IDLE };
const listeners = new Set();
let clearTimer = null;
let beforeUnloadAttached = false;
/** Local still object URL owned by the session (revoked on clear unless transferred). */
let ownedPosterUrl = null;
let uploadGeneration = 0;

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

function revokeOwnedPoster() {
  if (ownedPosterUrl) {
    URL.revokeObjectURL(ownedPosterUrl);
    ownedPosterUrl = null;
  }
}

function cancelClearTimer() {
  if (!clearTimer) return;
  clearTimeout(clearTimer);
  clearTimer = null;
}

export function clearReelUploadSession() {
  cancelClearTimer();
  uploadGeneration += 1;
  detachBeforeUnload();
  revokeOwnedPoster();
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
 * @param {{
 *   file: File,
 *   caption?: string,
 *   clientDurationMs?: number,
 *   posterUrl?: string | null,
 *   mutations: {
 *     createReel: Function,
 *     uploadMedia: Function,
 *     initMultipart?: Function,
 *     completeMultipart?: Function,
 *     abortMultipart?: Function,
 *     deleteReel?: Function,
 *   },
 * }} opts
 * @returns {boolean}
 */
export function startReelUpload(opts) {
  if (session.status === 'uploading') {
    return false;
  }

  const { file, caption, clientDurationMs, posterUrl, mutations } = opts;
  if (!file || !mutations?.createReel) {
    return false;
  }

  cancelClearTimer();
  uploadGeneration += 1;
  const generation = uploadGeneration;

  revokeOwnedPoster();
  ownedPosterUrl = posterUrl || null;

  setSession({
    status: 'uploading',
    percent: 0,
    stage: 'preparing',
    posterUrl: ownedPosterUrl,
    error: null,
    reelId: null,
  });
  attachBeforeUnload();

  void (async () => {
    try {
      const created = await publishReel(mutations, {
        file,
        caption,
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

      const reelId = Number(created?.id);
      const nextReelId = Number.isFinite(reelId) && reelId > 0 ? reelId : null;

      // Local still + original file for this tab. Server media is used after refresh.
      if (nextReelId) {
        if (ownedPosterUrl) {
          rememberClientReelPoster(nextReelId, ownedPosterUrl);
          ownedPosterUrl = null;
        }
        try {
          rememberClientReelVideo(nextReelId, URL.createObjectURL(file));
        } catch {
          // Playback can fall back to the server original.
        }
      }

      try {
        store.dispatch(
          baseApi.util.invalidateTags([
            { type: 'Reel', id: 'MINE' },
            { type: 'Reel', id: 'FEED' },
            ...(nextReelId ? [{ type: 'Reel', id: nextReelId }] : []),
          ]),
        );
      } catch {
        // ignore
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

      const isNetworkError = err?.status === 'FETCH_ERROR' || err?.status === 'TIMEOUT_ERROR';
      const message = isNetworkError
        ? 'Connection lost. Check your network and try again.'
        : err?.data?.message || err?.error || err?.message || 'Could not publish reel. Please try again.';
      setSession({
        status: 'error',
        error: typeof message === 'string' ? message : 'Could not publish reel. Please try again.',
      });
      detachBeforeUnload();
    }
  })();

  return true;
}
