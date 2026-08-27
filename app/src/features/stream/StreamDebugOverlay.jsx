import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { isStreamDebugEnabled } from '@/lib/utils/streamDebugLog';
import { clearStreamDebugLines, getStreamDebugLinesText, subscribeStreamDebugLines } from '@/lib/utils/streamDebugStore';

/** Reserved strip below the status bar — native overlay is pushed down by this amount. */
export const STREAM_DEBUG_PANEL_PX = 120;

/**
 * On-device stream debug console — portaled above app chrome.
 * Enable with DEV builds or localStorage tapeya_stream_debug=1.
 * Native WKWebView sits above Capacitor; {@link STREAM_DEBUG_PANEL_PX} pushes the player down so logs stay visible.
 */
export function StreamDebugOverlay({ enabled = true }) {
  const [lines, setLines] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => subscribeStreamDebugLines(setLines), []);

  const handleCopy = useCallback(async () => {
    const text = getStreamDebugLinesText();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2000);
    }
  }, []);

  if (!enabled || typeof document === 'undefined') {
    return null;
  }

  const panel = (
    <div
      className="pointer-events-auto fixed inset-x-0 top-0 z-[9999] flex flex-col border-b border-lime-400/35 bg-black/95 font-mono text-[10px] leading-snug text-lime-300 shadow-lg backdrop-blur-md"
      data-stream-debug=""
      style={{
        height: `calc(env(safe-area-inset-top, 0px) + ${STREAM_DEBUG_PANEL_PX}px)`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-lime-400/20 px-2 py-1">
        <span className="text-[11px] font-semibold text-lime-200">Stream debug</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-lime-200/90 active:bg-white/10"
            onClick={() => void handleCopy()}
          >
            {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy'}
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-lime-200/90 active:bg-white/10"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-lime-200/90 active:bg-white/10"
            onClick={() => clearStreamDebugLines()}
          >
            Clear
          </button>
        </div>
      </div>
      {!collapsed ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1 select-text">
          {lines.length === 0 ? (
            <p className="text-lime-200/60">Waiting for stream events…</p>
          ) : (
            lines.map((line, index) => (
              <p key={`${index}-${line.slice(0, 24)}`} className="break-all whitespace-pre-wrap">
                {line}
              </p>
            ))
          )}
        </div>
      ) : (
        <p className="shrink-0 px-2 py-0.5 text-lime-200/50">{lines.length} log lines — tap Show</p>
      )}
    </div>
  );

  return createPortal(panel, document.body);
}

/** Whether the live page should mount {@link StreamDebugOverlay}. */
export function shouldShowStreamDebugOverlay() {
  return isStreamDebugEnabled();
}
