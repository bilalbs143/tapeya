import { useEffect } from 'react';

import { GraphicsBootstrapError } from '@/graphics/bootstrap/GraphicsBootstrapError';
import GraphicsView from '@/graphics/entry/GraphicsView';
import { useGetGraphicSessionQuery } from '@/graphics/entry/hooks/graphicSessionApiBinding';
import { useTokenExpiryWarning } from '@/graphics/entry/hooks/useTokenExpiryWarning';

/**
 * RTK Query's `error` field is `FetchBaseQueryError | SerializedError` — only the
 * former (an actual HTTP response) has `status`/`data`; a `SerializedError` is a
 * thrown JS error (network failure before a response, etc.) and has neither.
 * @param {unknown} error
 * @returns {error is import('@reduxjs/toolkit/query').FetchBaseQueryError}
 */
function isFetchBaseQueryError(error) {
  return Boolean(error) && typeof error === 'object' && 'status' in /** @type {object} */ (error);
}

/** @param {{ accessToken: string, sessionId: string|null }} props */
export default function SignedGraphicsBootstrap({ accessToken, sessionId }) {
  const sessionQuery = useGetGraphicSessionQuery(accessToken, {
    skip: !accessToken,
  });

  useTokenExpiryWarning(accessToken);

  useEffect(() => {
    if (sessionQuery.isError && sessionQuery.data) {
      console.error(
        '[SignedGraphicsBootstrap] Session refetch failed after a prior success (token likely expired) — continuing to render the last known session instead of blanking the overlay.',
        { status: isFetchBaseQueryError(sessionQuery.error) ? sessionQuery.error.status : null, sessionId },
      );
    }
  }, [sessionQuery.isError, sessionQuery.data, sessionQuery.error, sessionId]);

  if (!accessToken || !sessionId) {
    return (
      <GraphicsBootstrapError
        reason="missing-access-token"
        message="Graphics URL is missing a valid access token."
        sessionId={sessionId}
      />
    );
  }

  // Prefer the last-known-good session even if a later background refetch failed
  // (e.g. the token expired mid-broadcast and a context-hash refresh 403'd). RTK
  // Query only clears `error`/`status` on rejection, never `data` — see
  // rtk-query's queryThunk.rejected reducer — so `data` staying truthy here means
  // this is genuinely "was working, latest refresh failed," not a fresh failure.
  // A stale-but-visible graphic is a safer on-air failure mode than an overlay
  // that vanishes mid-ball with no operator-visible warning.
  if (sessionQuery.data) {
    return <GraphicsView accessToken={accessToken} sessionId={sessionId} />;
  }

  if (sessionQuery.isError) {
    const fetchError = isFetchBaseQueryError(sessionQuery.error) ? sessionQuery.error : null;
    const status = fetchError?.status ?? null;
    const errorData = /** @type {{ message?: string }|undefined} */ (fetchError?.data);
    const message = errorData?.message ?? 'Invalid or expired graphics link.';

    return <GraphicsBootstrapError reason="bootstrap-failed" message={message} status={status} sessionId={sessionId} />;
  }

  return null;
}
