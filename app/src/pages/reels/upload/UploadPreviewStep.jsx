/**
 * Full-screen portrait preview before adding reel details.
 * On Next, capture a still from this playing video for the details thumb / client cover.
 */

import { useEffect, useRef, useState } from 'react';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { applyInlineVideoAttributes } from '@/features/reels/inlineVideo';
import { captureHtmlVideoFrameJpeg } from '@/lib/utils/extractReelPoster';
import { Button } from '@/ui/Button';

export function UploadPreviewStep({
  previewUrl,
  onBack,
  onNext,
  onChangeVideo,
  onPosterCapture = null,
  error = null,
  isBusy = false,
}) {
  const videoRef = useRef(null);
  const onPosterRef = useRef(onPosterCapture);
  onPosterRef.current = onPosterCapture;
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewUrl) return undefined;

    applyInlineVideoAttributes(video);

    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      video.play().catch(() => {});
    };

    video.load();
    video.addEventListener('loadeddata', start);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) start();

    return () => {
      done = true;
      video.removeEventListener('loadeddata', start);
      video.pause();
    };
  }, [previewUrl]);

  const handleNext = async () => {
    if (isBusy || isCapturing) return;
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      if (video && onPosterRef.current) {
        if (video.paused) {
          try {
            await video.play();
          } catch {
            // still attempt capture
          }
        }
        const blob = await captureHtmlVideoFrameJpeg(video);
        if (blob) onPosterRef.current(blob);
      }
      onNext();
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-56px-70px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-black lg:min-h-[calc(100dvh-56px-env(safe-area-inset-top))]">
      <video
        key={previewUrl}
        ref={videoRef}
        src={previewUrl}
        playsInline
        muted
        loop
        preload="auto"
        className="absolute inset-0 h-full w-full object-contain"
      >
        <track kind="captions" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70" />

      <div className="relative z-10 flex items-center justify-between px-4 pt-3">
        <AppSubpageBackButton
          onClick={onBack}
          aria-label="Back"
          className="pointer-events-auto"
          disabled={isBusy || isCapturing}
        />
        <button
          type="button"
          onClick={onChangeVideo}
          disabled={isBusy || isCapturing}
          className="pointer-events-auto rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white active:opacity-80 disabled:opacity-50"
        >
          {isBusy ? 'Checking…' : 'Change'}
        </button>
      </div>

      <div className="relative z-10 mt-auto flex flex-col items-center gap-3 px-4 pb-5">
        {error ? (
          <p className="w-full max-w-sm rounded-xl bg-black/70 px-3 py-2 text-center text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="orange"
          onClick={handleNext}
          disabled={isBusy || isCapturing}
          loading={isCapturing}
          className="w-full! max-w-sm rounded-full!"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
