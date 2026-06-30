import { createPortal } from 'react-dom';

import {
  buildCssRotatedStageHiddenStyle,
  buildCssRotatedStageStyle,
} from '@/features/stream/landscapeRotatedStageStyle';
import { useVisualViewportSize } from '@/hooks/useVisualViewportSize';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z, LIVE_BROADCAST_LANDSCAPE_HEADER_ROW } from '@/lib/constants/liveBroadcastLayout';

const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;

/** Solid chrome for iOS landscape underlay — blur fails to composite over native video. */
const IOS_TOGGLE_BTN =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-neutral-700 ring-1 ring-white/20 transition-opacity active:opacity-80';

/**
 * iOS native landscape chrome.
 *
 * LIVE + viewer count — rotated 90° to match web LandscapeRotatedStage / native embed video.
 * Exit toggle — fixed to the physical screen (not rotated).
 */
export function IosLandscapeStreamChrome({ headerSlot, onToggleLandscape }) {
  const size = useVisualViewportSize();

  if (typeof document === 'undefined') {
    return null;
  }

  const ready = size.w > 0 && size.h > 0;
  const rotatedStageStyle = ready
    ? buildCssRotatedStageStyle(size, { promoteLayer: true })
    : buildCssRotatedStageHiddenStyle();

  return createPortal(
    <>
      {headerSlot && (
        <div
          className="pointer-events-none fixed inset-0 overflow-hidden"
          style={{ zIndex: LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z - 1 }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div style={rotatedStageStyle}>
              <div className="relative size-full">
                <div className={LIVE_BROADCAST_LANDSCAPE_HEADER_ROW}>
                  <div className="pointer-events-none relative flex items-center justify-center">{headerSlot}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="pointer-events-none fixed right-0 bottom-0 p-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        style={{ zIndex: LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z, WebkitTransform: 'translateZ(1px)' }}
      >
        <button
          type="button"
          onClick={onToggleLandscape}
          className={`pointer-events-auto ${IOS_TOGGLE_BTN}`}
          aria-label="Rotate to portrait"
        >
          <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
        </button>
      </div>
    </>,
    document.body,
  );
}
