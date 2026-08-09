/**
 * Blocking reel upload progress dialog.
 * Keeps the app unusable until the upload finishes, fails, or the user dismisses an error.
 */

import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { clearReelUploadSession, useReelUploadSession } from '@/features/reels/reelUploadSessionStore';
import { buildReelSharePath } from '@/lib/share';
import {
  DialogDescription,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

function PreviewThumb({ src }) {
  if (!src) {
    return <span className="bg-surface block h-full w-full" />;
  }

  return (
    <video
      src={src}
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
      onLoadedMetadata={(event) => {
        try {
          const video = event.currentTarget;
          if (video.currentTime < 0.05) {
            video.currentTime = Math.min(0.1, (video.duration || 1) * 0.01);
          }
        } catch {
          // ignore seek failures on some platforms
        }
      }}
    >
      <track kind="captions" />
    </video>
  );
}

function uploadCopy(status, stage) {
  if (status === 'error') {
    return {
      title: 'Upload failed',
      detail: 'Couldn’t publish your reel.',
    };
  }
  if (status === 'success') {
    return {
      title: 'Reel posted',
      detail: 'Your reel is ready.',
    };
  }
  if (stage === 'preparing') {
    return {
      title: 'Preparing reel',
      detail: 'Getting things ready…',
    };
  }
  if (stage === 'finishing') {
    return {
      title: 'Finishing up',
      detail: 'Almost there — keep the app open.',
    };
  }
  return {
    title: 'Uploading reel',
    detail: 'Please keep the app open.',
  };
}

export function ReelUploadProgressDialog() {
  const navigate = useNavigate();
  const session = useReelUploadSession();
  const open = session.status !== 'idle';
  const isUploading = session.status === 'uploading';
  const isError = session.status === 'error';
  const isSuccess = session.status === 'success';
  const safePercent = Math.min(100, Math.max(0, Math.round(session.percent)));
  const copy = uploadCopy(session.status, session.stage);
  const centerLabel = isError ? '!' : isSuccess ? '✓' : `${safePercent}%`;
  const barPercent = isSuccess || isError ? 100 : safePercent;

  useEffect(() => {
    if (session.status !== 'success' || !session.reelId) return;
    navigate(buildReelSharePath(session.reelId), { replace: true });
  }, [navigate, session.reelId, session.status]);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen || isUploading) return;
    clearReelUploadSession();
  };

  return (
    <BaseDialog open={open} onOpenChange={handleOpenChange} overlayClassName="bg-black/80">
      <DialogHeaderRow hideClose reserveCloseSpace={false}>
        <DialogTitle className={`${dialogPrimaryTitleClass} w-full text-center`}>{copy.title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col items-center pb-5">
        <div
          className={`relative w-[118px] overflow-hidden rounded-[18px] border-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ${
            isError ? 'border-[#FF453A]/70' : 'border-brand/45'
          }`}
          style={{ aspectRatio: '9 / 16' }}
        >
          <PreviewThumb src={session.previewUrl} />
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/45 to-black/30">
            <span
              className={`text-[28px] leading-none font-extrabold tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] ${
                isError ? 'text-[#FF453A]' : 'text-white'
              }`}
            >
              {centerLabel}
            </span>
          </div>
        </div>

        <div className="mt-5 w-full max-w-[240px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-out ${isError ? 'bg-[#FF453A]' : 'bg-brand'}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>

        <DialogDescription className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed">
          {isError ? session.error || copy.detail : copy.detail}
        </DialogDescription>
      </DialogScrollBody>

      <DialogSaveButton disabled={isUploading} onClick={() => clearReelUploadSession()}>
        {isError ? 'Dismiss' : 'Done'}
      </DialogSaveButton>
    </BaseDialog>
  );
}
