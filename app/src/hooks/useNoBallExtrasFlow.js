import { useCallback, useMemo, useState } from 'react';

import { computeNoBallEquation } from '@/lib/utils/noBallExtras';

const DEFAULT_NO_BALL_TYPE = 'over_footed';
const DEFAULT_NO_BALL_RUNS_TYPE = 'from_bat';

/**
 * State for the no-ball extras dialog (type, runs type, NB+N, live equation).
 *
 * @param {Array<{ value: string, label: string }>} [noBallTypeOptions] from /enums
 * @param {Array<{ value: string, label: string }>} [noBallRunsTypeOptions] from /enums
 */
export function useNoBallExtrasFlow(noBallTypeOptions = [], noBallRunsTypeOptions = []) {
  const enumsLoaded = noBallTypeOptions.length > 0 && noBallRunsTypeOptions.length > 0;

  const [noBallType, setNoBallType] = useState(() => noBallTypeOptions[0]?.value ?? DEFAULT_NO_BALL_TYPE);
  const [noBallRunsType, setNoBallRunsType] = useState(() => noBallRunsTypeOptions[0]?.value ?? DEFAULT_NO_BALL_RUNS_TYPE);
  const [extraRuns, setExtraRuns] = useState(0);

  const equation = useMemo(() => computeNoBallEquation(extraRuns), [extraRuns]);

  const buildPayload = useCallback(
    () => ({
      extraRuns,
      noBallType,
      noBallRunsType,
    }),
    [extraRuns, noBallType, noBallRunsType],
  );

  // Block submission if enums haven't loaded — prevents submitting hardcoded fallback values.
  const canContinue = enumsLoaded && Boolean(noBallType && noBallRunsType);

  return {
    enumsLoaded,
    noBallType,
    setNoBallType,
    noBallRunsType,
    setNoBallRunsType,
    extraRuns,
    setExtraRuns,
    equation,
    buildPayload,
    canContinue,
  };
}
