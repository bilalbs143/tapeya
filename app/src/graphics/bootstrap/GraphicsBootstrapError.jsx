import { useEffect, useMemo } from 'react';

const isDebugMode = () => {
  try {
    return new URLSearchParams(window.location.search).has('debug');
  } catch {
    return false;
  }
};

/**
 * Graphics bootstrap failure — invisible in vMix unless `?debug` is present in the URL.
 * Always logs to console.error for DevTools access.
 *
 * @param {{
 *   reason: string,
 *   message: string,
 *   status?: number|string|null,
 *   sessionId?: string|null,
 * }} props
 */
export function GraphicsBootstrapError({ reason, message, status = null, sessionId = null }) {
  const debug = useMemo(isDebugMode, []);

  useEffect(() => {
    console.error('[graphics:bootstrap]', { reason, message, status, sessionId });
  }, [reason, message, status, sessionId]);

  if (debug) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 12,
          left: 12,
          zIndex: 99999,
          maxWidth: '50vw',
          padding: '8px 14px',
          borderRadius: 6,
          background: 'rgba(180,30,30,0.92)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          lineHeight: 1.4,
          pointerEvents: 'none',
        }}
      >
        <strong>Bootstrap Error</strong>
        <br />
        {reason}: {message}
        {status ? ` (${status})` : ''}
      </div>
    );
  }

  return (
    <div
      className="graphics-bootstrap-error"
      data-reason={reason}
      data-status={status ?? ''}
      data-session-id={sessionId ?? ''}
      aria-hidden="true"
      hidden
    />
  );
}
