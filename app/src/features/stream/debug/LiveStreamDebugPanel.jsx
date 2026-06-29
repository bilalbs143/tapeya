import { useCallback, useEffect, useMemo, useState } from 'react';

import { BOTTOM_NAV_CLEARANCE } from '@/lib/constants/layout';

import {
  clearLiveStreamDebugLogs,
  getLiveStreamDebugEnvironment,
  getLiveStreamDebugLogs,
  isLiveStreamDebugEnabled,
  liveStreamDebugLog,
  setLiveStreamDebugEnabled,
  subscribeLiveStreamDebug,
} from './liveStreamDebug';

const PANEL_BOTTOM = `calc(env(safe-area-inset-bottom) + ${BOTTOM_NAV_CLEARANCE}px)`;
const PANEL_CLASS = 'pointer-events-auto fixed right-2 z-[120] max-w-[min(100vw-16px,420px)] font-mono text-[10px] leading-snug text-white';

/**
 * On-device debug panel for live broadcast / YouTube iframe issues (especially iOS).
 * Enable via toggle or: localStorage.setItem('liveStreamDebug', '1')
 */
export function LiveStreamDebugPanel({ streamSnapshot = null }) {
  const [enabled, setEnabled] = useState(() => isLiveStreamDebugEnabled());
  const [expanded, setExpanded] = useState(true);
  const [logs, setLogs] = useState(() => getLiveStreamDebugLogs());
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeLiveStreamDebug(() => setLogs(getLiveStreamDebugLogs())), []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const id = window.setInterval(() => setTick((n) => n + 1), 2000);
    return () => window.clearInterval(id);
  }, [enabled]);

  const env = useMemo(() => getLiveStreamDebugEnvironment(), [tick]);

  const toggleEnabled = useCallback(() => {
    const next = !enabled;
    setLiveStreamDebugEnabled(next);
    setEnabled(next);
    if (next) {
      liveStreamDebugLog('debug-enabled', { env: getLiveStreamDebugEnvironment() });
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={toggleEnabled}
        style={{ bottom: PANEL_BOTTOM }}
        className={`${PANEL_CLASS} rounded bg-black/80 px-2 py-1 text-white/70`}
      >
        Stream debug ({logs.length})
      </button>
    );
  }

  return (
    <div className={PANEL_CLASS} style={{ bottom: PANEL_BOTTOM }}>
      <div className="overflow-hidden rounded-lg border border-white/20 bg-black/90 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-1.5">
          <span className="font-semibold text-yellow-300">Live stream debug</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setExpanded((v) => !v)} className="rounded px-1 text-white/70">
              {expanded ? '−' : '+'}
            </button>
            <button type="button" onClick={clearLiveStreamDebugLogs} className="rounded px-1 text-white/70">
              Clear
            </button>
            <button type="button" onClick={toggleEnabled} className="rounded px-1 text-white/70">
              {enabled ? 'Off' : 'On'}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="max-h-[40vh] overflow-y-auto px-2 py-1.5">
            <div className="mb-2 space-y-0.5 text-white/60">
              <div>platform: {String(env.capacitorPlatform)} native={String(env.isNative)}</div>
              {streamSnapshot ? (
                <>
                  <div>
                    status: {String(streamSnapshot.status ?? '—')} mode: {String(streamSnapshot.playbackMode ?? '—')}
                  </div>
                  <div className="break-all">iframe: {String(streamSnapshot.iframeSrc ?? '—')}</div>
                  <div className="break-all">direct: {String(streamSnapshot.directEmbedUrl ?? '—')}</div>
                  <div className="break-all">proxy: {String(streamSnapshot.usesProxy ?? false)}</div>
                </>
              ) : null}
            </div>

            {logs.length === 0 ? (
              <p className="text-white/40">No logs yet — open a live broadcast.</p>
            ) : (
              <ul className="space-y-1">
                {logs
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <li key={entry.id} className="border-t border-white/5 pt-1">
                      <span className="text-white/40">{entry.ts}</span>{' '}
                      <span className="text-cyan-300">{entry.tag}</span>
                      <pre className="mt-0.5 whitespace-pre-wrap break-all text-white/80">
                        {JSON.stringify(entry.payload, null, 0)}
                      </pre>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
