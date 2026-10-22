import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/Spinner';

import type { GoLiveCaptureMode } from '../lib/broadcastCameraUtils';

export type { GoLiveCaptureMode };

type GoLiveCaptureButtonProps = {
  mode: GoLiveCaptureMode;
  onClick: () => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

/**
 * Dominant go-live shutter — circle to start, square to end.
 * Media overlay: white ring + `danger` fill — not a full-width Button bar.
 */
export function GoLiveCaptureButton({ mode, onClick, disabled = false, className }: GoLiveCaptureButtonProps) {
  const isEnd = mode === 'end';
  const isConnecting = mode === 'connecting';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isConnecting}
      aria-label={isEnd ? 'End Broadcast' : isConnecting ? 'Starting Broadcast' : 'Go Live'}
      className={cn(
        'relative grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full',
        'border-4 border-white touch-manipulation transition-transform active:scale-95',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        'disabled:opacity-60',
        className
      )}
    >
      {isConnecting ? (
        <Spinner size="md" tone="media" label="Starting" />
      ) : isEnd ? (
        <span className="bg-danger block h-7 w-7 rounded-field" aria-hidden />
      ) : (
        <span className="bg-danger block h-14 w-14 rounded-full" aria-hidden />
      )}
    </button>
  );
}
