/**
 * Empty select-video step for reel upload (mobile-first).
 * Page chrome matches Support: sticky AppSubpageHeader + Container inside MainLayout.
 */

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { Container } from '@/ui/Container';

/** Same camera glyph as the Reels feed upload control. */
function CameraIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function AspectIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="7" y="3" width="10" height="18" rx="2" />
    </svg>
  );
}

function QualityIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 7h16v10H4z" />
      <path d="M8 17v2M16 17v2M9 10h1.5a1.5 1.5 0 0 1 0 3H9V10zm5 0h2v5h-2z" />
    </svg>
  );
}

function TrimIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
    </svg>
  );
}

function ShieldIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const TIPS = [
  { Icon: AspectIcon, label: 'Vertical 9:16 looks best' },
  { Icon: QualityIcon, label: 'Keep it clear and steady' },
  { Icon: TrimIcon, label: 'Trim to the best moments' },
];

export function UploadEmptyStep({
  onSelectVideo,
  onBack,
  error,
  limitsHint = null,
  isBusy = false,
  busyLabel = null,
  handoffHint = null,
}) {
  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="New Reel" onBack={onBack} backAriaLabel="Go back" />

      <Container className="pb-8">
        {handoffHint ? (
          <p
            className="border-border bg-surface text-muted mb-3 rounded-[12px] border px-3.5 py-3 text-[13px] leading-relaxed"
            role="status"
          >
            {handoffHint}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSelectVideo}
          disabled={isBusy}
          aria-label="Select video from your phone"
          aria-busy={isBusy || undefined}
          className="border-border bg-surface active:bg-surface-raised flex w-full flex-col items-center rounded-[17px] border px-5 py-8 text-center transition-colors disabled:opacity-60"
        >
          <span className="border-brand/35 bg-brand/10 text-brand flex size-[72px] items-center justify-center rounded-full border-2">
            {isBusy ? (
              <span className="border-brand/30 border-t-brand size-8 animate-spin rounded-full border-2" aria-hidden />
            ) : (
              <CameraIcon className="size-8" />
            )}
          </span>

          <span className="mt-5 text-[17px] font-semibold text-white">
            {isBusy ? busyLabel || 'Checking video…' : 'Share your best moments'}
          </span>
          <span className="text-muted mt-1.5 max-w-[260px] text-[13px] leading-relaxed">
            Phone videos from Android or iPhone — MP4, MOV, and more
            {limitsHint ? (
              <>
                <br />
                <span className="text-muted/80">{limitsHint}</span>
              </>
            ) : null}
          </span>

          <span className="border-brand/50 text-brand mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-semibold">
            <CameraIcon className="size-4" />
            Browse Files
          </span>
        </button>

        {error ? (
          <p className="mt-3 text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8">
          <p className="text-muted mb-3 flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase">
            <span className="bg-brand size-1.5 rounded-full" aria-hidden />
            Tips for great reels
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {TIPS.map(({ Icon, label }) => (
              <li
                key={label}
                className="border-border bg-surface flex flex-col items-center gap-2 rounded-[12px] border px-2 py-3 text-center"
              >
                <span className="bg-brand/15 text-brand flex size-9 items-center justify-center rounded-full">
                  <Icon className="size-4" />
                </span>
                <span className="text-[11px] leading-snug font-medium text-white/85">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-surface mt-6 flex items-start gap-3 rounded-[12px] border px-3.5 py-3.5">
          <span className="text-brand bg-brand/15 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
            <ShieldIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white">You control who sees it</p>
            <p className="text-muted mt-0.5 text-[12px] leading-relaxed">
              Choose Everyone, Followers, or Only Me before you post. Caption and privacy choices carry over when you start from
              Create post.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
