import { useEffect, useMemo, useState } from 'react';

import { getEligibleLtDefaultZoneCPanels } from '../../../core/domain/ltDefaultZoneC';
import { ltDefaultZoneC } from '../config';

/**
 * Cycles eligible Default LT Zone C panels based on innings context.
 *
 * @param {Record<string, unknown>} props Processor props
 * @param {Record<string, unknown>|null|undefined} frame Score bar frame
 * @returns {import('../../../core/domain/ltDefaultZoneC.js').LtDefaultZoneCPanel|null}
 */
export function useLtDefaultZoneCRotation(props, frame) {
  const ctx = useMemo(
    () => ({
      inningsNumber: Number(props.inningsNumber ?? 1),
      currentRR: frame?.rr ?? props.currentRR ?? '',
      requiredRR: frame?.rrr ?? props.requiredRR ?? '',
      projectedScore: frame?.projectedScore ?? props.projectedScore ?? null,
      partnershipRuns: frame?.partnership?.runs ?? props.partnershipRuns ?? 0,
      runsToWin: frame?.runsToWin ?? props.runsToWin ?? null,
    }),
    [
      props.inningsNumber,
      props.currentRR,
      props.requiredRR,
      props.projectedScore,
      props.partnershipRuns,
      props.runsToWin,
      frame?.rr,
      frame?.rrr,
      frame?.projectedScore,
      frame?.partnership?.runs,
      frame?.runsToWin,
    ],
  );

  const eligible = useMemo(() => getEligibleLtDefaultZoneCPanels(ctx.inningsNumber, ctx, ltDefaultZoneC), [ctx]);

  const rotationKey = useMemo(() => eligible.join('|'), [eligible]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [rotationKey]);

  useEffect(() => {
    if (eligible.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % eligible.length);
    }, ltDefaultZoneC.dwellMs);
    return () => window.clearInterval(timer);
  }, [eligible.length, rotationKey]);

  return eligible[index] ?? eligible[0] ?? null;
}
