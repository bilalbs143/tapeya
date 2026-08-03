/**
 * UploadReels
 *
 * Mobile-first TikTok-style flow: empty → portrait preview → details → post.
 * Route: /reels/upload
 *
 * After Post, upload continues in the background (floating chip) while the user
 * browses /reels.
 *
 * Coding guidelines: docs/Coding guidelines.md (§2 selectors)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { getReelUploadSession, startReelUpload, useReelUploadSession } from '@/features/reels/reelUploadSessionStore';
import { awaitReelPosterBriefly, extractReelPosterJpeg } from '@/lib/utils/extractReelPoster';
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
  useInitReelMultipartMutation,
  useUploadReelMultipartPartMutation,
} from '@/store/api/reelsApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';

import { UploadDetailsStep } from './upload/UploadDetailsStep';
import { UploadEmptyStep } from './upload/UploadEmptyStep';
import { UploadPreviewStep } from './upload/UploadPreviewStep';

const UPLOAD_REEL_TAB = 'my-videos';
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
  const posterPromiseRef = useRef(/** @type {Promise<Blob|null>|null} */ (null));
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
  const [uploadPart] = useUploadReelMultipartPartMutation();
  const [completeMultipart] = useCompleteReelMultipartMutation();
  const [abortMultipart] = useAbortReelMultipartMutation();

  const [step, setStep] = useState(STEPS.EMPTY);
  const [caption, setCaption] = useState(() => (typeof location.state?.caption === 'string' ? location.state.caption : ''));
  const [visibility, setVisibility] = useState(() =>
    location.state?.visibility === 'followers' || location.state?.visibility === 'private' ? location.state.visibility : 'public',
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [error, setError] = useState(null);
  const [handoffHint, setHandoffHint] = useState(() => {
    const state = location.state;
    if (!state || typeof state !== 'object') return null;
    if (state.fromCompose && !(state.file instanceof File)) {
      return 'Your caption and privacy selection are ready. Choose a video to continue.';
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

  /** Clear local video UI without revoking — session owns the object URL after Post. */
  const detachPreviewWithoutRevoke = useCallback(() => {
    previewUrlRef.current = null;
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  const openPicker = useCallback(() => {
    if (isBusyPublishing || isValidatingFile) return;
    fileInputRef.current?.click();
  }, [isBusyPublishing, isValidatingFile]);

  const commitSelectedFile = useCallback(
    (file) => {
      revokePreviewUrl();
      const nextUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextUrl;
      posterPromiseRef.current = null;
      setSelectedFile(file);
      setPreviewUrl(nextUrl);
      setStep(STEPS.PREVIEW);
    },
    [revokePreviewUrl],
  );

  /** Poster extract after preview has a frame — avoids iOS blank first paint. */
  const handlePreviewReady = useCallback(() => {
    if (!selectedFile || posterPromiseRef.current) return;
    posterPromiseRef.current = extractReelPosterJpeg(selectedFile).catch(() => null);
  }, [selectedFile]);

  const clearVideo = useCallback(() => {
    revokePreviewUrl();
    posterPromiseRef.current = null;
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [revokePreviewUrl]);

  useEffect(() => {
    return () => {
      // Only revoke if we still own the URL (not handed off to the upload session).
      revokePreviewUrl();
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

  // Support legacy handoffs that included a File. The current compose flow
  // intentionally hands off only caption and visibility, then opens this picker.
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

  const handleBackFromEmpty = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleBackFromPreview = useCallback(() => {
    if (isBusyPublishing) return;
    clearVideo();
    setError(null);
    setStep(STEPS.EMPTY);
  }, [clearVideo, isBusyPublishing]);

  const handleBackFromDetails = useCallback(() => {
    if (isBusyPublishing) return;
    setError(null);
    setStep(STEPS.PREVIEW);
  }, [isBusyPublishing]);

  const handleInsertHashtag = useCallback(() => {
    setCaption((prev) => appendHashtagToken(prev));
  }, []);

  const handlePublish = useCallback(async () => {
    if (!selectedFile || isBusyPublishing) return;
    if (getReelUploadSession().status === 'uploading') {
      setError('Another reel is still uploading. Please wait.');
      return;
    }

    setIsStarting(true);
    setError(null);

    const file = selectedFile;
    const sessionPreviewUrl = previewUrl;
    const postCaption = caption.trim() || undefined;
    const postVisibility = visibility;

    try {
      const precheck = await validateReelVideoForUpload(file, uploadLimits);
      if (!precheck.ok) {
        setError(precheck.error);
        return;
      }

      // Re-check after await — another upload may have started (e.g. second tab / race).
      if (getReelUploadSession().status === 'uploading') {
        setError('Another reel is still uploading. Please wait.');
        return;
      }

      let clientDurationMs;
      try {
        const duration = precheck.durationSec != null ? precheck.durationSec : await probeReelVideoDuration(file);
        if (duration != null) clientDurationMs = Math.round(duration * 1000);
      } catch {
        // optional — server can probe during transcode
      }

      const posterBlob = await awaitReelPosterBriefly(posterPromiseRef.current, 2000);
      posterPromiseRef.current = null;

      // Hand ownership of the object URL to the session before navigating away.
      detachPreviewWithoutRevoke();
      setCaption('');
      setVisibility('public');
      setStep(STEPS.EMPTY);

      const started = startReelUpload({
        file,
        caption: postCaption,
        visibility: postVisibility,
        clientDurationMs,
        previewUrl: sessionPreviewUrl,
        posterBlob,
        mutations: {
          createReel,
          uploadMedia,
          initMultipart,
          uploadPart,
          completeMultipart,
          abortMultipart,
        },
      });

      if (!started) {
        // Re-attach for retry if session refused (should be rare).
        previewUrlRef.current = sessionPreviewUrl;
        setSelectedFile(file);
        setPreviewUrl(sessionPreviewUrl);
        setCaption(postCaption || '');
        setVisibility(postVisibility || 'public');
        setStep(STEPS.DETAILS);
        setError('Another reel is still uploading. Please wait.');
        return;
      }

      navigate('/reels', { state: { tab: UPLOAD_REEL_TAB } });
    } catch (err) {
      // If we already detached the preview, restore so the user can retry.
      if (!previewUrlRef.current && sessionPreviewUrl) {
        previewUrlRef.current = sessionPreviewUrl;
        setSelectedFile(file);
        setPreviewUrl(sessionPreviewUrl);
        setCaption(postCaption || '');
        setVisibility(postVisibility || 'public');
        setStep(STEPS.DETAILS);
      }
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
    visibility,
    previewUrl,
    createReel,
    uploadMedia,
    initMultipart,
    uploadPart,
    completeMultipart,
    abortMultipart,
    navigate,
    detachPreviewWithoutRevoke,
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
          onBack={handleBackFromEmpty}
          error={error}
          limitsHint={limitsHint}
          isBusy={isValidatingFile || uploadSession.status === 'uploading'}
          busyLabel={uploadSession.status === 'uploading' ? 'Upload in progress…' : undefined}
          handoffHint={
            uploadSession.status === 'uploading'
              ? 'Your reel is still uploading. Progress is shown in the top-left — you can browse while it finishes.'
              : handoffHint
          }
        />
      ) : null}

      {step === STEPS.PREVIEW && previewUrl ? (
        <UploadPreviewStep
          previewUrl={previewUrl}
          onBack={handleBackFromPreview}
          onNext={() => {
            setError(null);
            setStep(STEPS.DETAILS);
          }}
          onChangeVideo={openPicker}
          onPreviewReady={handlePreviewReady}
          error={error}
          isBusy={isValidatingFile}
        />
      ) : null}

      {step === STEPS.DETAILS && previewUrl ? (
        <UploadDetailsStep
          previewUrl={previewUrl}
          caption={caption}
          onCaptionChange={setCaption}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          onInsertHashtag={handleInsertHashtag}
          onBack={handleBackFromDetails}
          onPost={handlePublish}
          isPublishing={isBusyPublishing}
          error={error}
        />
      ) : null}
    </div>
  );
}
