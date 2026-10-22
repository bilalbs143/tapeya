import { selectAccessToken } from '@/shared/store/authSlice';
import { store } from '@/shared/store/store';

import type { Reel } from '../model/schemas';
import { uploadReelPartWithProgress } from './uploadReelPart';

type MutationTrigger<Arg, Result> = {
  (arg: Arg): { unwrap: () => Promise<Result> };
};

export type PublishReelMutations = {
  createReel: MutationTrigger<{ caption?: string | undefined; client_duration_ms?: number | undefined }, Reel>;
  initMultipart: MutationTrigger<number, { upload_id: string; part_size?: number | undefined }>;
  completeMultipart: MutationTrigger<
    {
      id: number;
      uploadId: string;
      totalParts: number;
      filename?: string | undefined;
      contentType?: string | undefined;
    },
    Reel
  >;
  abortMultipart: MutationTrigger<{ id: number; uploadId: string }, unknown>;
  deleteReel: MutationTrigger<number, unknown>;
};

export type PublishProgress = { stage: string; percent: number };

type RtkErrorLike = {
  status?: number | string;
  data?: { message?: string; type?: string };
  error?: string;
  message?: string;
};

export function isTransientUploadError(err: unknown): boolean {
  const e = err as RtkErrorLike | null;
  if (!e) return false;
  if (e.status === 'FETCH_ERROR' || e.status === 'TIMEOUT_ERROR') return true;
  if (e.data?.type === 'UPLOAD_FAILED' || e.data?.type === 'SERVICE_UNAVAILABLE') return true;
  const code = Number(e.status);
  return code === 408 || code === 429 || code === 500 || code === 502 || code === 503 || code === 504;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 8): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts || !isTransientUploadError(err)) throw err;
      const delayMs = Math.min(8000, 400 * 2 ** (attempt - 1));
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function bestEffortDeleteShell(deleteReel: PublishReelMutations['deleteReel'], id: number | null | undefined) {
  if (id == null) return;
  try {
    await deleteReel(id).unwrap();
  } catch {
    // ignore — upload error is what the UI should show
  }
}

/** Create reel row then multipart-upload original with XHR progress. */
export async function publishReel(
  mutations: PublishReelMutations,
  {
    file,
    caption,
    clientDurationMs,
    onProgress,
  }: {
    file: File;
    caption?: string | undefined;
    clientDurationMs?: number | undefined;
    onProgress?: ((p: PublishProgress) => void) | undefined;
  }
): Promise<Reel> {
  const { createReel, initMultipart, completeMultipart, abortMultipart, deleteReel } = mutations;

  let lastPercent = -1;
  const report = (stage: string, percent: number) => {
    const next = Math.min(100, Math.max(0, Math.round(percent)));
    if (next === lastPercent && stage === 'uploading') return;
    lastPercent = next;
    onProgress?.({ stage, percent: next });
  };
  const reportBytes = (bytesUploaded: number) => {
    report('uploading', 10 + (bytesUploaded / Math.max(file.size, 1)) * 82);
  };

  report('preparing', 2);

  const created = await withRetry(() =>
    createReel({
      caption: caption || undefined,
      client_duration_ms: clientDurationMs || undefined,
    }).unwrap()
  );

  report('preparing', 8);

  const init = await withRetry(() => initMultipart(created.id).unwrap());
  const uploadId = init.upload_id;
  const partSize = init.part_size || 5 * 1024 * 1024;
  const totalParts = Math.max(1, Math.ceil(file.size / partSize));

  reportBytes(0);

  try {
    let bytesDone = 0;
    for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
      const start = (partNumber - 1) * partSize;
      const blob = file.slice(start, start + partSize);
      const accessToken = selectAccessToken(store.getState());

      await withRetry(() =>
        uploadReelPartWithProgress({
          reelId: created.id,
          uploadId,
          partNumber,
          file: blob,
          accessToken,
          onUploadProgress: (loaded) => reportBytes(bytesDone + Math.min(loaded, blob.size)),
        })
      );

      bytesDone += blob.size;
      reportBytes(bytesDone);
    }

    report('finishing', 94);
    await withRetry(() =>
      completeMultipart({
        id: created.id,
        uploadId,
        totalParts,
        filename: file.name,
        contentType: file.type || undefined,
      }).unwrap()
    );
    report('finishing', 100);
  } catch (err) {
    if (uploadId) {
      try {
        await abortMultipart({ id: created.id, uploadId }).unwrap();
      } catch {
        // ignore
      }
    }
    await bestEffortDeleteShell(deleteReel, created.id);
    throw err;
  }

  return created;
}

export function uploadErrorMessage(err: unknown): string {
  const e = err as RtkErrorLike | null;
  if (!e) return 'Could not publish reel. Please try again.';
  if (e.status === 'FETCH_ERROR' || e.status === 'TIMEOUT_ERROR') {
    return 'Connection lost. Check your network and try again.';
  }
  const message = e.data?.message || e.error || e.message;
  return typeof message === 'string' ? message : 'Could not publish reel. Please try again.';
}
