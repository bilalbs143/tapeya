import { describe, expect, it } from 'vitest';

import { getEligibleLtDefaultZoneCPanels, isLtDefaultZoneCPanelEligible } from '../ltDefaultZoneC.js';

const config = {
  firstInnings: ['crr', 'projectedScore', 'partnership'],
  secondInnings: ['rrr', 'crr', 'needTarget', 'partnership'],
};

describe('ltDefaultZoneC', () => {
  it('filters first-innings panels by eligibility', () => {
    const panels = getEligibleLtDefaultZoneCPanels(
      1,
      {
        inningsNumber: 1,
        currentRR: '8.0',
        projectedScore: 180,
        partnershipRuns: 0,
      },
      config,
    );

    expect(panels).toEqual(['crr', 'projectedScore']);
  });

  it('filters second-innings panels by eligibility', () => {
    const panels = getEligibleLtDefaultZoneCPanels(
      2,
      {
        inningsNumber: 2,
        currentRR: '7.5',
        requiredRR: '9.2',
        runsToWin: 42,
        partnershipRuns: 18,
      },
      config,
    );

    expect(panels).toEqual(['rrr', 'crr', 'needTarget', 'partnership']);
  });

  it('skips partnership when stand is zero', () => {
    expect(
      isLtDefaultZoneCPanelEligible('partnership', {
        inningsNumber: 1,
        partnershipRuns: 0,
      }),
    ).toBe(false);
  });

  it('returns empty when no panels are eligible', () => {
    const panels = getEligibleLtDefaultZoneCPanels(
      1,
      { inningsNumber: 1, currentRR: '', projectedScore: null, partnershipRuns: 0 },
      config,
    );
    expect(panels).toEqual([]);
  });
});
