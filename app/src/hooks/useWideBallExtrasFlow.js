import { useMemo, useState } from 'react';

import { computeWideBallEquation } from '@/lib/utils/wideBallExtras';

/**
 * State for the wide-ball extras dialog (WB+N selection + live equation).
 */
export function useWideBallExtrasFlow() {
  const [extraRuns, setExtraRuns] = useState(0);

  const equation = useMemo(() => computeWideBallEquation(extraRuns), [extraRuns]);

  return {
    extraRuns,
    setExtraRuns,
    equation,
  };
}
