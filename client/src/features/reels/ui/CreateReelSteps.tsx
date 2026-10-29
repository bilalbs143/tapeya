import type { FormEvent, ReactNode, RefObject } from 'react';

import { PageDock } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { FieldMessage } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { HashtagChipField } from '@/shared/ui/HashtagChipField';
import { AspectPortraitIcon, EyeIcon, TrimIcon, VideoIcon } from '@/shared/ui/icons';
import { ErrorState } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import {
  CREATE_REEL_STEPS,
  CREATE_REEL_TIPS,
  type CreateReelStep,
  type CreateReelTipIcon,
} from '../lib/createReelFlow';

function ReelTipIcon({ kind }: { kind: CreateReelTipIcon }) {
  if (kind === 'aspect') return <AspectPortraitIcon size="sm" className="text-brand-text h-4 w-4" strokeWidth={2} />;
  if (kind === 'quality') return <EyeIcon size="sm" className="text-brand-text h-4 w-4" strokeWidth={2} />;
  return <TrimIcon size="sm" className="text-brand-text h-4 w-4" strokeWidth={2} />;
}

type CreateReelStepsProps = {
  header: ReactNode;
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
  header,
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
  const footer =
    step === CREATE_REEL_STEPS.EMPTY ? (
      <StickyActionBar edge>
        <Button className="w-full" loading={isValidatingFile} disabled={uploadUploading} onClick={openPicker}>
          Browse Files
        </Button>
      </StickyActionBar>
    ) : step === CREATE_REEL_STEPS.PREVIEW && previewUrl ? (
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
    ) : step === CREATE_REEL_STEPS.DETAILS ? (
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
    ) : undefined;

  // Empty + preview use dock-fill so the pick zone / video stage stretch between chrome.
  // Details stays dock-scroll (form fields).
  const bodyMode = step === CREATE_REEL_STEPS.DETAILS ? 'scroll' : 'fill';

  let body: ReactNode = null;

  if (step === CREATE_REEL_STEPS.EMPTY) {
    body = (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3.5 pb-4">
        <button
          type="button"
          onClick={openPicker}
          disabled={isValidatingFile || uploadUploading}
          aria-label="Select Video From Your Phone"
          aria-busy={isValidatingFile || undefined}
          className="border-border-subtle bg-surface mb-3 flex min-h-[200px] w-full flex-1 flex-col items-center justify-center rounded-sheet border p-5 text-center disabled:opacity-60"
        >
          <span className="border-brand/35 bg-brand/10 mb-3 grid h-[56px] w-[56px] place-items-center rounded-full border-2">
            <VideoIcon size="lg" className="text-brand-text h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="text-ink mb-1 text-sm font-extrabold">
            {isValidatingFile ? 'Checking Video…' : 'Share Your Best Moments'}
          </p>
          <p className="text-muted max-w-[260px] text-3xs leading-snug">
            Phone videos from Android or iPhone — MP4, MOV, and more
            {limitsHint ? (
              <>
                <br />
                <span className="text-dim">{limitsHint}</span>
              </>
            ) : null}
          </p>
        </button>

        {settingsError ? (
          <div className="mb-3 shrink-0">
            <ErrorState
              title="Couldn't Load Upload Limits"
              description="You can still pick a video; size rules may not apply until this loads."
              onRetry={() => void refetchSettings()}
            />
          </div>
        ) : null}

        <section className="shrink-0" aria-labelledby="create-reel-tips-heading">
          <p
            id="create-reel-tips-heading"
            className="text-muted font-mono mb-2.5 flex items-center gap-2 text-4xs font-bold tracking-eyebrow uppercase"
          >
            <span className="bg-brand size-1.5 shrink-0 rounded-full" aria-hidden />
            Tips for Great Reels
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {CREATE_REEL_TIPS.map((tip) => (
              <li
                key={tip.id}
                className="border-border-subtle bg-surface flex flex-col items-center gap-2 rounded-panel border px-2 py-3 text-center"
              >
                <span className="bg-brand/15 grid h-9 w-9 place-items-center rounded-full">
                  <ReelTipIcon kind={tip.icon} />
                </span>
                <span className="text-body text-3xs leading-snug font-semibold">{tip.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {error ? (
          <p className="text-danger-soft mt-3 shrink-0 text-xs font-semibold" role="alert">
            {error}
          </p>
        ) : null}

        {uploadUploading ? (
          <p className="text-muted mt-3 shrink-0 text-3xs" role="status">
            Your reel is still uploading. Please wait until it finishes.
          </p>
        ) : null}
      </div>
    );
  } else if (step === CREATE_REEL_STEPS.PREVIEW && previewUrl) {
    body = (
      <>
        {/* Full-bleed stage between ScreenBar and StickyActionBar (object-contain letterboxes). */}
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
          <span className="border-border bg-surface/92 text-muted font-mono absolute bottom-3 left-1/2 inline-flex min-h-[26px] -translate-x-1/2 items-center gap-1.5 rounded-lg border px-2.5 text-4xs font-bold tracking-eyebrow">
            MUTED · LOOPING
          </span>
        </div>

        {error ? (
          <p className="text-danger-soft shrink-0 px-4 pt-2 text-center text-sm font-semibold" role="alert">
            {error}
          </p>
        ) : null}
      </>
    );
  } else if (step === CREATE_REEL_STEPS.DETAILS) {
    body = (
      <Form
        id="create-reel-form"
        density="compact"
        className="flex flex-col px-4 pt-3.5 pb-4"
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
          <HashtagChipField
            value={hashtags}
            onChange={setHashtags}
            editing={hashEditing}
            onEditingChange={setHashEditing}
            inputRef={hashRef}
            label={hashLabel}
          />
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
    );
  }

  return (
    <PageDock header={header} footer={footer} body={bodyMode}>
      {body}
    </PageDock>
  );
}
