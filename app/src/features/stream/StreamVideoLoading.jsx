export function StreamVideoLoading({ label = 'Loading Video…' }) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" aria-hidden />
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}
