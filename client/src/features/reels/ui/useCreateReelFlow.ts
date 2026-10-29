import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { APP_PATHS } from '@/shared/config/paths';
import { formatHashtagLabel, mergeCaptionWithHashtags } from '@/shared/lib/hashtags';
import { toast } from '@/shared/ui/toast';

import {
  useAbortReelMultipartMutation,
  useCompleteReelMultipartMutation,
  useCreateReelMutation,
  useDeleteReelMutation,
  useInitReelMultipartMutation,
} from '../api/reelsApi';
import {
  CREATE_REEL_CAPTION_MAX,
  CREATE_REEL_STEPS,
  type CreateReelLocationState,
  type CreateReelStep,
  settingInt,
} from '../lib/createReelFlow';
import { captureHtmlVideoFrameJpeg } from '../lib/extractReelPoster';
import { getReelUploadSession, startReelUpload, useReelUploadSession } from '../lib/reelUploadSession';
import { formatReelMaxUploadLabel, probeReelVideoDuration, validateReelVideoForUpload } from '../lib/reelVideoFormats';

/** Pick → preview → details → multipart upload (session survives navigation). */
export function useCreateReelFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as CreateReelLocationState;
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const posterUrlRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hashRef = useRef<HTMLInputElement>(null);
  const uploadSession = useReelUploadSession();

  const {
    data: publicSettings = [],
    isError: settingsError,
    refetch: refetchSettings,
  } = useGetPublicSystemSettingsQuery();
  const uploadLimits = useMemo(
    () => ({
      maxUploadMb: settingInt(publicSettings, 'reels_max_upload_mb'),
      maxDurationSeconds: settingInt(publicSettings, 'reels_max_duration_seconds'),
      minDurationSeconds: settingInt(publicSettings, 'reels_min_duration_seconds'),
    }),
    [publicSettings]
  );

  const [createReel] = useCreateReelMutation();
  const [initMultipart] = useInitReelMultipartMutation();
  const [completeMultipart] = useCompleteReelMultipartMutation();
  const [abortMultipart] = useAbortReelMultipartMutation();
  const [deleteReel] = useDeleteReelMutation();

  const [step, setStep] = useState<CreateReelStep>(CREATE_REEL_STEPS.EMPTY);
  const [caption, setCaption] = useState(() => (typeof state.caption === 'string' ? state.caption : state.body) || '');
  const [hashtags, setHashtags] = useState('');
  const [hashEditing, setHashEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fromPost = Boolean(state.body || state.caption || state.fromCompose);

  const isBusyPublishing = isStarting || uploadSession.status === 'uploading';

  const limitsHint = useMemo(() => {
    const parts: string[] = [];
    if (uploadLimits.maxDurationSeconds > 0) {
      parts.push(`up to ${uploadLimits.maxDurationSeconds}s`);
    }
    const sizeLabel = formatReelMaxUploadLabel(uploadLimits.maxUploadMb);
    if (sizeLabel) parts.push(`max ${sizeLabel}`);
    return parts.length ? parts.join(' · ') : 'Vertical video looks best · MP4 or MOV';
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
    fileRef.current?.click();
  }, [isBusyPublishing, isValidatingFile]);

  const commitSelectedFile = useCallback(
    (file: File) => {
      revokePreviewUrl();
      revokePosterUrl();
      const nextUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextUrl;
      setSelectedFile(file);
      setPreviewUrl(nextUrl);
      setStep(CREATE_REEL_STEPS.PREVIEW);
    },
    [revokePreviewUrl, revokePosterUrl]
  );

  const clearVideo = useCallback(() => {
    revokePreviewUrl();
    revokePosterUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [revokePreviewUrl, revokePosterUrl]);

  useEffect(() => {
    return () => {
      revokePreviewUrl();
      if (posterUrlRef.current) {
        URL.revokeObjectURL(posterUrlRef.current);
        posterUrlRef.current = null;
      }
    };
  }, [revokePreviewUrl]);

  useEffect(() => {
    if (hashEditing) hashRef.current?.focus();
  }, [hashEditing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewUrl || step !== CREATE_REEL_STEPS.PREVIEW) return undefined;

    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      void video.play().catch(() => {});
    };

    video.load();
    video.addEventListener('loadeddata', start);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) start();

    return () => {
      done = true;
      video.removeEventListener('loadeddata', start);
      video.pause();
    };
  }, [previewUrl, step]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
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
    [commitSelectedFile, isBusyPublishing, uploadLimits]
  );

  const goDetails = async () => {
    if (isBusyPublishing || isCapturing) return;
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      if (video) {
        if (video.paused) {
          try {
            await video.play();
          } catch {
            /* play() optional before frame capture */
          }
        }
        const blob = await captureHtmlVideoFrameJpeg(video);
        if (blob) {
          if (posterUrlRef.current) URL.revokeObjectURL(posterUrlRef.current);
          const url = URL.createObjectURL(blob);
          posterUrlRef.current = url;
          setPosterUrl(url);
        }
      }
      setError(null);
      setStep(CREATE_REEL_STEPS.DETAILS);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePublish = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedFile || isBusyPublishing) return;
    if (getReelUploadSession().status === 'uploading') {
      toast({
        title: 'Another Reel Is Still Uploading…',
        description: 'Wait for it to finish, then post this one.',
        tone: 'error',
      });
      return;
    }

    setIsStarting(true);
    setError(null);

    const file = selectedFile;
    const sessionPosterUrl = posterUrl;
    const postCaption = mergeCaptionWithHashtags(caption, hashtags) || undefined;

    try {
      const precheck = await validateReelVideoForUpload(file, uploadLimits);
      if (!precheck.ok) {
        setError(precheck.error);
        return;
      }

      let clientDurationMs: number | undefined;
      try {
        const duration = precheck.durationSec != null ? precheck.durationSec : await probeReelVideoDuration(file);
        if (duration != null) clientDurationMs = Math.round(duration * 1000);
      } catch {
        /* duration probe optional */
      }

      const started = startReelUpload({
        file,
        caption: postCaption,
        clientDurationMs,
        posterUrl: sessionPosterUrl,
        mutations: {
          createReel,
          initMultipart,
          completeMultipart,
          abortMultipart,
          deleteReel,
        },
      });

      if (!started) {
        toast({
          title: 'Another Reel Is Still Uploading…',
          description: 'Wait for it to finish, then post this one.',
          tone: 'error',
        });
        return;
      }

      revokePreviewUrl();
      posterUrlRef.current = null;
      setSelectedFile(null);
      setPreviewUrl(null);
      setPosterUrl(null);
      setCaption('');
      setHashtags('');
      setStep(CREATE_REEL_STEPS.EMPTY);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : '';
      setError(message || 'Could not publish reel. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const onBack =
    step === CREATE_REEL_STEPS.EMPTY
      ? () => navigate(APP_PATHS.create)
      : () => {
          if (isBusyPublishing) return;
          if (step === CREATE_REEL_STEPS.DETAILS) {
            setError(null);
            setStep(CREATE_REEL_STEPS.PREVIEW);
            return;
          }
          clearVideo();
          setError(null);
          setStep(CREATE_REEL_STEPS.EMPTY);
        };

  const chromeTitle =
    step === CREATE_REEL_STEPS.EMPTY ? 'New Reel' : step === CREATE_REEL_STEPS.PREVIEW ? 'Preview' : 'Details';
  const hashLabel = hashtags ? formatHashtagLabel(hashtags) : 'Hashtags';

  return {
    fileRef,
    videoRef,
    hashRef,
    uploadSession,
    settingsError,
    refetchSettings,
    step,
    setStep,
    caption,
    setCaption,
    hashtags,
    setHashtags,
    hashEditing,
    setHashEditing,
    selectedFile,
    previewUrl,
    posterUrl,
    isValidatingFile,
    isCapturing,
    error,
    fromPost,
    isBusyPublishing,
    limitsHint,
    openPicker,
    handleFileChange,
    goDetails,
    handlePublish,
    onBack,
    chromeTitle,
    hashLabel,
    captionMax: CREATE_REEL_CAPTION_MAX,
    steps: CREATE_REEL_STEPS,
  };
}
