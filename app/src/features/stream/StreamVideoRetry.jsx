export function StreamVideoRetry({ onRetry, visible = false }) {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black px-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
      aria-hidden={!visible}
    >
      <p className="text-center text-sm text-white/60">Video didn&apos;t start. Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-black transition-opacity active:opacity-80"
      >
        Try Again
      </button>
    </div>
  );
}
