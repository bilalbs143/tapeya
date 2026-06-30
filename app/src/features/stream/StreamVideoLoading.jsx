export function StreamVideoLoading({ label = 'Loading Video…', visible = true }) {
  return (
    <div
      className={`absolute -inset-px z-10 flex flex-col items-center justify-center gap-3 bg-black transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      aria-label={label}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" aria-hidden />
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}
