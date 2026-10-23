import type { FormEvent, RefObject } from 'react';

import { Button } from '@/shared/ui/Button';
import { FieldMessage } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { LockIcon, PauseIcon, VideoIcon } from '@/shared/ui/icons';
import { ErrorState } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { CREATE_REEL_STEPS, type CreateReelStep } from '../lib/createReelFlow';

type CreateReelStepsProps = {
  step: CreateReelStep;
  setStep: (step: CreateReelStep) => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  hashRef: RefObject<HTMLInputElement | null>;
  previewUrl: string | null;
  posterUrl: string | null;
  selectedFile: File | null;
  caption: string;
  setCaption: (value: string) => void;
  hashtags: string;
  setHashtags: (value: string) => void;
  hashEditing: boolean;
  setHashEditing: (value: boolean) => void;
  hashLabel: string;
  captionMax: number;
  fromPost: boolean;
  error: string | null;
  limitsHint: string;
  settingsError: boolean;
  refetchSettings: () => void;
  uploadUploading: boolean;
  isValidatingFile: boolean;
  isCapturing: boolean;
  isBusyPublishing: boolean;
  openPicker: () => void;
  goDetails: () => void;
  handlePublish: (e?: FormEvent) => void;
};

/** Empty / preview / details panels for CreateReelPage. */
export function CreateReelSteps({
  step,
  setStep,
  videoRef,
  hashRef,
  previewUrl,
  posterUrl,
  selectedFile,
  caption,
  setCaption,
  hashtags,
  setHashtags,
  hashEditing,
  setHashEditing,
  hashLabel,
  captionMax,
  fromPost,
  error,
  limitsHint,
  settingsError,
  refetchSettings,
  uploadUploading,
  isValidatingFile,
  isCapturing,
  isBusyPublishing,
  openPicker,
  goDetails,
  handlePublish,
}: CreateReelStepsProps) {
  return (
    <>
      {step === CREATE_REEL_STEPS.EMPTY ? (
        <>
          <div data-scroll-to-top className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3.5 pb-4">
            <button
              type="button"
              onClick={openPicker}
              disabled={isValidatingFile || uploadUploading}
              className="border-border-subtle bg-surface mb-3 flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-sheet border border-dashed p-5 text-center disabled:opacity-60"
            >
              <span className="bg-brand/16 mb-3 grid h-[52px] w-[52px] place-items-center rounded-sheet">
                <VideoIcon size="lg" className="text-brand-text h-6 w-6" strokeWidth={1.8} />
              </span>
              <p className="text-ink mb-1 text-sm font-extrabold">Share Your Best Moments</p>
              <p className="text-muted max-w-[190px] text-3xs leading-snug">{limitsHint}</p>
            </button>

            {settingsError ? (
              <div className="mb-3">
                <ErrorState
                  title="Couldn't Load Upload Limits"
                  description="You can still pick a video; size rules may not apply until this loads."
                  onRetry={() => void refetchSettings()}
                />
              </div>
            ) : null}

            <div className="border-border-subtle bg-page-deep mb-3 flex gap-2 rounded-panel border px-3 py-2.5">
              <LockIcon size="xs" className="text-dim mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <p className="text-muted text-3xs leading-snug">
                Reels you post appear publicly on your profile and in Explore.
              </p>
            </div>

            {error ? (
              <p className="text-danger-soft mb-2 text-xs font-semibold" role="alert">
                {error}
              </p>
            ) : null}

            {uploadUploading ? (
              <p className="text-muted mb-2 text-3xs" role="status">
                Your reel is still uploading. Please wait until it finishes.
              </p>
            ) : null}
          </div>

          <StickyActionBar edge>
            <Button className="w-full" loading={isValidatingFile} disabled={uploadUploading} onClick={openPicker}>
              Browse Files
            </Button>
          </StickyActionBar>
        </>
      ) : null}

      {step === CREATE_REEL_STEPS.PREVIEW && previewUrl ? (
        <>
          <div className="bg-page relative min-h-0 flex-1 overflow-hidden">
            <video
              key={previewUrl}
              ref={videoRef}
              src={previewUrl}
              className="absolute inset-0 h-full w-full object-contain"
              muted
              loop
              playsInline
              preload="auto"
            />
            <span
              aria-hidden
              className="border-border bg-veil-72 absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border"
            >
              <PauseIcon size="sm" className="text-ink h-4 w-4" />
            </span>
            <span className="border-border bg-surface/92 text-muted font-mono absolute bottom-3 left-1/2 inline-flex min-h-[26px] -translate-x-1/2 items-center gap-1.5 rounded-lg border px-2.5 text-4xs font-bold tracking-eyebrow">
              MUTED · LOOPING
            </span>
          </div>

          {error ? (
            <p className="text-danger-soft px-4 pt-2 text-center text-sm font-semibold" role="alert">
              {error}
            </p>
          ) : null}

          <StickyActionBar edge>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isValidatingFile || isCapturing}
                onClick={openPicker}
              >
                {isValidatingFile ? 'Checking…' : 'Change'}
              </Button>
              <Button
                className="flex-[1.3]"
                loading={isCapturing}
                disabled={isValidatingFile || isCapturing}
                onClick={() => void goDetails()}
              >
                Next
              </Button>
            </div>
          </StickyActionBar>
        </>
      ) : null}

      {step === CREATE_REEL_STEPS.DETAILS ? (
        <>
          <Form
            id="create-reel-form"
            density="compact"
            data-scroll-to-top
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3.5 pb-4"
            onSubmit={(e) => void handlePublish(e)}
          >
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(CREATE_REEL_STEPS.PREVIEW)}
                className="bg-media-deep h-[70px] w-[52px] shrink-0 overflow-hidden rounded-field"
                aria-label="Preview Clip"
              >
                {posterUrl || previewUrl ? (
                  <video
                    src={previewUrl ?? undefined}
                    poster={posterUrl ?? undefined}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
              <div className="min-w-0 flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, captionMax))}
                  rows={2}
                  placeholder="Write a Caption…"
                  aria-label="Caption"
                  className="text-body placeholder:text-dim w-full resize-none bg-transparent text-2xs leading-snug outline-none"
                />
              </div>
            </div>

            <div className="flex items-center">
              {hashEditing ? (
                <span className="border-border-subtle bg-surface inline-flex min-h-[30px] max-w-[70%] items-center gap-1.5 rounded-field border px-3">
                  <span className="font-mono text-xs font-extrabold text-brand-text">#</span>
                  <input
                    ref={hashRef}
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value.replace(/^#+\s*/, ''))}
                    onBlur={() => setHashEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setHashEditing(false);
                    }}
                    placeholder="final tapeball"
                    aria-label="Hashtags"
                    className="text-body min-w-0 flex-1 bg-transparent text-3xs font-bold outline-none"
                  />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setHashEditing(true)}
                  className="border-border-subtle bg-surface text-body inline-flex min-h-[30px] items-center gap-1.5 rounded-field border px-3 text-3xs font-bold"
                >
                  <span className="font-mono text-xs font-extrabold text-brand-text">#</span>
                  {hashLabel}
                </button>
              )}
              <span className="text-dim font-mono ml-auto text-3xs font-semibold tabular-nums">
                {caption.length} / {captionMax}
              </span>
            </div>

            {fromPost ? (
              <div className="border-border-subtle bg-page-deep text-muted rounded-icon border px-2.5 py-2 text-3xs leading-snug">
                Caption carried over from Create post.
              </div>
            ) : null}

            <FieldMessage error={error ?? undefined} />
          </Form>

          <StickyActionBar edge>
            <Button
              type="submit"
              form="create-reel-form"
              className="w-full"
              disabled={!selectedFile || isBusyPublishing || caption.length > captionMax}
              loading={isBusyPublishing}
            >
              Post
            </Button>
          </StickyActionBar>
        </>
      ) : null}
    </>
  );
}
