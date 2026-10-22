import { useSyncExternalStore } from 'react';

import { baseApi } from '@/shared/api/baseApi';
import { store } from '@/shared/store/store';

import { publishReel, type PublishReelMutations, uploadErrorMessage } from './publishReel';

export type ReelUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type ReelUploadSession = {
  status: ReelUploadStatus;
  percent: number;
  stage: string;
  posterUrl: string | null;
  error: string | null;
  reelId: number | null;
};

const IDLE: ReelUploadSession = {
  status: 'idle',
  percent: 0,
  stage: 'preparing',
  posterUrl: null,
  error: null,
  reelId: null,
};

let session: ReelUploadSession = { ...IDLE };
const listeners = new Set<() => void>();
let clearTimer: ReturnType<typeof setTimeout> | null = null;
let beforeUnloadAttached = false;
let ownedPosterUrl: string | null = null;
let uploadGeneration = 0;

export const REEL_UPLOAD_SUCCESS_CLEAR_MS = 2200;

function emit() {
  listeners.forEach((listener) => listener());
}

function setSession(patch: Partial<ReelUploadSession>) {
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

function onBeforeUnload(event: BeforeUnloadEvent) {
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

export function subscribeReelUploadSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReelUploadSession() {
  return useSyncExternalStore(subscribeReelUploadSession, getReelUploadSession, () => IDLE);
}

function isCurrentGeneration(generation: number) {
  return generation === uploadGeneration;
}

export function startReelUpload(opts: {
  file: File;
  caption?: string | undefined;
  clientDurationMs?: number | undefined;
  posterUrl?: string | null | undefined;
  mutations: PublishReelMutations;
}): boolean {
  if (session.status === 'uploading') return false;

  const { file, caption, clientDurationMs, posterUrl, mutations } = opts;
  if (!file || !mutations?.createReel) return false;

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

      // Keep poster for the success dialog; don't revoke until clear.
      ownedPosterUrl = null;

      try {
        store.dispatch(
          baseApi.util.invalidateTags([
            { type: 'Reel', id: 'LIST-mine' },
            { type: 'Reel', id: 'LIST-explore' },
            ...(nextReelId ? [{ type: 'Reel' as const, id: nextReelId }] : []),
          ])
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
      setSession({
        status: 'error',
        error: uploadErrorMessage(err),
      });
      detachBeforeUnload();
    }
  })();

  return true;
}
