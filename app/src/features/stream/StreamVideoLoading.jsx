import { Loader } from '@/ui/Loader';

/**
 * Connecting / loading overlay for stream players.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {string|null} [props.posterUrl] — stream thumbnail or YouTube hqdefault
 * @param {boolean} [props.visible]
 */
export function StreamVideoLoading({
  label = 'Connecting to the video…',
  hint = 'This usually takes under 30 to 40 seconds.',
  posterUrl = null,
  visible = true,
}) {
  return (
    <div
      className={`pointer-events-none absolute -top-px -right-px -bottom-[5px] -left-px z-10 flex flex-col items-center justify-center gap-3 overflow-hidden bg-black pb-[5px] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      aria-label={label}
    >
      {posterUrl ? (
        <>
          <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" draggable={false} />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </>
      ) : null}
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        <Loader />
        <p className="text-sm text-white/80">{label}</p>
        {hint ? <p className="max-w-xs text-[12px] text-white/50">{hint}</p> : null}
      </div>
    </div>
  );
}
