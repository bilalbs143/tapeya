import { Spinner } from '@/shared/ui/Spinner';

type StreamVideoLoadingProps = {
  visible: boolean;
  label?: string | undefined;
  hint?: string | undefined;
  posterUrl?: string | null | undefined;
};

/** Connecting overlay while a stream / embed starts. */
export function StreamVideoLoading({
  visible,
  label = 'Connecting to the video…',
  hint = 'This usually takes under 30 to 40 seconds.',
  posterUrl = null,
}: StreamVideoLoadingProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 overflow-hidden bg-black"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {posterUrl ? (
        <>
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </>
      ) : null}
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        <Spinner size="lg" tone="media" aria-hidden label="" />
        <p className="text-sm text-white/80">{label}</p>
        {hint ? <p className="text-2xs max-w-xs text-white/50">{hint}</p> : null}
      </div>
    </div>
  );
}
