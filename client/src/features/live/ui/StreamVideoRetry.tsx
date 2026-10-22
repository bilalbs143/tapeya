type StreamVideoRetryProps = {
  visible: boolean;
  onRetry: () => void;
};

/** Retry slate when connecting times out or playback fails. */
export function StreamVideoRetry({ visible, onRetry }: StreamVideoRetryProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black px-4"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-center text-sm text-white/60">Video didn&apos;t start. Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-chip bg-white px-5 py-2 text-xs font-semibold text-black active:opacity-80"
      >
        Try Again
      </button>
    </div>
  );
}
