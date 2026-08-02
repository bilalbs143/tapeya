/**
 * Full-screen portrait preview before adding reel details.
 * Uses MainLayout chrome (navbar + bottom nav); fills remaining viewport height.
 */

import { useEffect, useRef } from 'react';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { Button } from '@/ui/Button';

export function UploadPreviewStep({ previewUrl, onBack, onNext, onChangeVideo, error = null, isBusy = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewUrl) return undefined;
    video.play().catch(() => {
      // Autoplay may be blocked; user can tap Next regardless.
    });
    return () => {
      video.pause();
    };
  }, [previewUrl]);

  return (
    <div className="relative flex min-h-[calc(100dvh-56px-70px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-black lg:min-h-[calc(100dvh-56px-env(safe-area-inset-top))]">
      <video
        ref={videoRef}
        src={previewUrl}
        playsInline
        muted
        loop
        preload="metadata"
        className="absolute inset-0 h-full w-full object-contain"
      >
        <track kind="captions" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70" />

      <div className="relative z-10 flex items-center justify-between px-4 pt-3">
        <AppSubpageBackButton onClick={onBack} aria-label="Back" className="pointer-events-auto" disabled={isBusy} />
        <button
          type="button"
          onClick={onChangeVideo}
          disabled={isBusy}
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
        <Button type="button" variant="auth" onClick={onNext} disabled={isBusy} className="w-full! max-w-sm rounded-full!">
          Next
        </Button>
      </div>
    </div>
  );
}
