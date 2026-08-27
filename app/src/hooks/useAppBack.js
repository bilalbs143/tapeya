import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { APP_BACK_FALLBACK, getHistoryIdx, resolveAppBackAction } from '@/lib/navigation/appBack';

/** Pop when there is in-app history, otherwise `/home`. */
export function useAppBack(fallback = APP_BACK_FALLBACK) {
  const navigate = useNavigate();

  return useCallback(() => {
    const action = resolveAppBackAction({ historyIdx: getHistoryIdx(), fallback });
    if (action.type === 'pop') navigate(-1);
    else navigate(action.to, { replace: true });
  }, [fallback, navigate]);
}
