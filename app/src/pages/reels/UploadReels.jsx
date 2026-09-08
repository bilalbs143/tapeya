/**
 * UploadReels — empty → portrait preview → details → post.
 * Client still is for UI only; server generates the real poster later.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { getReelUploadSession, startReelUpload, useReelUploadSession } from '@/features/reels/reelUploadSessionStore';
import {
  formatReelMaxUploadLabel,
  probeReelVideoDuration,
  REEL_VIDEO_ACCEPT,
  validateReelVideoForUpload,
} from '@/lib/utils/reelVideoFormats';
import { useUploadMediaMutation } from '@/store/api/mediaApi';
import {
  useAbortReelMultipartMutation,
  useCompleteReelMultipartMutation,
  useCreateReelMutation,
  useDeleteReelMutation,
  useInitReelMultipartMutation,
} from '@/store/api/reelsApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';

import { UploadDetailsStep } from './upload/UploadDetailsStep';
import { UploadEmptyStep } from './upload/UploadEmptyStep';
import { UploadPreviewStep } from './upload/UploadPreviewStep';

const STEPS = {
  EMPTY: 'empty',
  PREVIEW: 'preview',
  DETAILS: 'details',
};

function settingRowKey(row) {
  if (!row?.key) return '';
  return typeof row.key === 'string' ? row.key : String(row.key);
}

function settingInt(settings, key) {
  const row = settings.find((item) => settingRowKey(item) === key);
  const value = Number(row?.value);
  return Number.isFinite(value) ? value : 0;
}

function appendHashtagToken(caption) {
  const trimmed = caption.trimEnd();
  if (!trimmed) return '#';
  if (/\s#$/.test(`${trimmed} `) || trimmed.endsWith('#')) return trimmed;
  return `${trimmed} #`;
}

export default function UploadReels() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const posterUrlRef = useRef(null);
  const seededFromComposeRef = useRef(false);
  const uploadSession = useReelUploadSession();

  const { data: publicSettings = [] } = useGetPublicSystemSettingsQuery();
  const uploadLimits = useMemo(
    () => ({
      maxUploadMb: settingInt(publicSettings, 'reels_max_upload_mb'),
      maxDurationSeconds: settingInt(publicSettings, 'reels_max_duration_seconds'),
      minDurationSeconds: settingInt(publicSettings, 'reels_min_duration_seconds'),
    }),
    [publicSettings],
  );

  const [createReel] = useCreateReelMutation();
  const [uploadMedia] = useUploadMediaMutation();
  const [initMultipart] = useInitReelMultipartMutation();
  const [completeMultipart] = useCompleteReelMultipartMutation();
  const [abortMultipart] = useAbortReelMultipartMutation();
  const [deleteReel] = useDeleteReelMutation();

  const [step, setStep] = useState(STEPS.EMPTY);
  const [caption, setCaption] = useState(() => (typeof location.state?.caption === 'string' ? location.state.caption : ''));
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [posterUrl, setPosterUrl] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [error, setError] = useState(null);
  const [handoffHint, setHandoffHint] = useState(() => {
    const state = location.state;
    if (!state || typeof state !== 'object') return null;
    if (state.fromCompose && !(state.file instanceof File)) {
      return 'Your caption is ready. Choose a video to continue.';
    }
    return null;
  });

  const isBusyPublishing = isStarting || uploadSession.status === 'uploading';

  const limitsHint = useMemo(() => {
    const parts = [];
    if (uploadLimits.maxDurationSeconds > 0) {
      parts.push(`up to ${uploadLimits.maxDurationSeconds}s`);
    }
    const sizeLabel = formatReelMaxUploadLabel(uploadLimits.maxUploadMb);
    if (sizeLabel) parts.push(`max ${sizeLabel}`);
    return parts.length ? parts.join(' · ') : null;
  }, [uploadLimits]);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const revokePosterUrl = useCallback(() => {
    if (posterUrlRef.current) {
      URL.revokeObjectURL(posterUrlRef.current);
      posterUrlRef.current = null;
    }
    setPosterUrl(null);
  }, []);

  const openPicker = useCallback(() => {
    if (isBusyPublishing || isValidatingFile) return;
    fileInputRef.current?.click();
  }, [isBusyPublishing, isValidatingFile]);

  const commitSelectedFile = useCallback(
    (file) => {
      revokePreviewUrl();
      revokePosterUrl();
      const nextUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextUrl;
      setSelectedFile(file);
      setPreviewUrl(nextUrl);
      setStep(STEPS.PREVIEW);
    },
    [revokePreviewUrl, revokePosterUrl],
  );

  const handlePosterCapture = useCallback((blob) => {
    if (!blob) return;
    if (posterUrlRef.current) URL.revokeObjectURL(posterUrlRef.current);
    const url = URL.createObjectURL(blob);
    posterUrlRef.current = url;
    setPosterUrl(url);
  }, []);

  const clearVideo = useCallback(() => {
    revokePreviewUrl();
    revokePosterUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [revokePreviewUrl, revokePosterUrl]);

  useEffect(() => {
    return () => {
      revokePreviewUrl();
      // Poster may have been handed to the upload session — only revoke if we still own it.
      if (posterUrlRef.current) {
        URL.revokeObjectURL(posterUrlRef.current);
        posterUrlRef.current = null;
      }
    };
  }, [revokePreviewUrl]);

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target?.files?.[0];
      e.target.value = '';
      if (!file || isBusyPublishing) return;

      setIsValidatingFile(true);
      setError(null);
      try {
        const result = await validateReelVideoForUpload(file, uploadLimits);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        commitSelectedFile(file);
      } finally {
        setIsValidatingFile(false);
      }
    },
    [commitSelectedFile, isBusyPublishing, uploadLimits],
  );

  useEffect(() => {
    if (seededFromComposeRef.current) return;
    const file = location.state?.file;
    if (!(file instanceof File)) {
      if (location.state?.fromCompose) {
        seededFromComposeRef.current = true;
      }
      return;
    }
    seededFromComposeRef.current = true;
    setHandoffHint(null);
    void (async () => {
      setIsValidatingFile(true);
      setError(null);
      try {
        const result = await validateReelVideoForUpload(file, uploadLimits);
        if (!result.ok) {
          setError(result.error);
          setHandoffHint('Couldn’t use the video from Create post. Pick another file below — your caption is still filled in.');
          return;
        }
        commitSelectedFile(file);
      } finally {
        setIsValidatingFile(false);
      }
    })();
  }, [commitSelectedFile, location.state, uploadLimits]);

  const handlePublish = useCallback(async () => {
    if (!selectedFile || isBusyPublishing) return;
    if (getReelUploadSession().status === 'uploading') {
      setError('Another reel is still uploading. Please wait.');
      return;
    }

    setIsStarting(true);
    setError(null);

    const file = selectedFile;
    const sessionPosterUrl = posterUrl;
    const postCaption = caption.trim() || undefined;

    try {
      const precheck = await validateReelVideoForUpload(file, uploadLimits);
      if (!precheck.ok) {
        setError(precheck.error);
        return;
      }

      if (getReelUploadSession().status === 'uploading') {
        setError('Another reel is still uploading. Please wait.');
        return;
      }

      let clientDurationMs;
      try {
        const duration = precheck.durationSec != null ? precheck.durationSec : await probeReelVideoDuration(file);
        if (duration != null) clientDurationMs = Math.round(duration * 1000);
      } catch {
        // optional
      }

      const started = startReelUpload({
        file,
        caption: postCaption,
        clientDurationMs,
        posterUrl: sessionPosterUrl,
        mutations: {
          createReel,
          uploadMedia,
          initMultipart,
          completeMultipart,
          abortMultipart,
          deleteReel,
        },
      });

      if (!started) {
        setError('Another reel is still uploading. Please wait.');
        return;
      }

      // Hand poster to session; drop local video UI.
      revokePreviewUrl();
      posterUrlRef.current = null;
      setSelectedFile(null);
      setPreviewUrl(null);
      setPosterUrl(null);
      setCaption('');
      setStep(STEPS.EMPTY);
    } catch (err) {
      const message = err?.data?.message || err?.error || err?.message || 'Could not publish reel. Please try again.';
      setError(typeof message === 'string' ? message : 'Could not publish reel. Please try again.');
    } finally {
      setIsStarting(false);
    }
  }, [
    selectedFile,
    isBusyPublishing,
    uploadLimits,
    caption,
    posterUrl,
    createReel,
    uploadMedia,
    initMultipart,
    completeMultipart,
    abortMultipart,
    deleteReel,
    revokePreviewUrl,
  ]);

  return (
    <div className="relative bg-black">
      <input
        ref={fileInputRef}
        type="file"
        accept={REEL_VIDEO_ACCEPT}
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      {step === STEPS.EMPTY || !previewUrl ? (
        <UploadEmptyStep
          onSelectVideo={openPicker}
          onBack={() => navigate(-1)}
          error={error}
          limitsHint={limitsHint}
          isBusy={isValidatingFile || uploadSession.status === 'uploading'}
          busyLabel={uploadSession.status === 'uploading' ? 'Upload in progress…' : undefined}
          handoffHint={
            uploadSession.status === 'uploading' ? 'Your reel is still uploading. Please wait until it finishes.' : handoffHint
          }
        />
      ) : null}

      {step === STEPS.PREVIEW && previewUrl ? (
        <UploadPreviewStep
          previewUrl={previewUrl}
          onBack={() => {
            if (isBusyPublishing) return;
            clearVideo();
            setError(null);
            setStep(STEPS.EMPTY);
          }}
          onNext={() => {
            setError(null);
            setStep(STEPS.DETAILS);
          }}
          onChangeVideo={openPicker}
          onPosterCapture={handlePosterCapture}
          error={error}
          isBusy={isValidatingFile}
        />
      ) : null}

      {step === STEPS.DETAILS && (previewUrl || posterUrl) ? (
        <UploadDetailsStep
          posterUrl={posterUrl}
          caption={caption}
          onCaptionChange={setCaption}
          onInsertHashtag={() => setCaption((prev) => appendHashtagToken(prev))}
          onBack={() => {
            if (isBusyPublishing) return;
            setError(null);
            setStep(STEPS.PREVIEW);
          }}
          onPost={handlePublish}
          isPublishing={isBusyPublishing}
          error={error}
        />
      ) : null}
    </div>
  );
}
