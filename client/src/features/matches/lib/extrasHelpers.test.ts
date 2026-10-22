import { describe, expect, it } from 'vitest';

import { computeNoBallEquation, noBallSelectionToUiFields } from './noBallExtras';
import { computeWideBallEquation, wideBallSelectionToUiFields } from './wideBallExtras';

describe('wideBallExtras', () => {
  it('builds the penalty equation', () => {
    expect(computeWideBallEquation(0).text).toBe('1 Wide Runs + 0 Runs Extra = 1 Total Run');
    expect(computeWideBallEquation(2).total).toBe(3);
  });

  it('maps selection to UiBall fields', () => {
    expect(wideBallSelectionToUiFields(3)).toEqual({ type: 'wd', extraRuns: 3 });
  });
});

describe('noBallExtras', () => {
  it('builds the penalty equation', () => {
    expect(computeNoBallEquation(1).text).toBe('1 No-Ball Runs + 1 Runs Extra = 2 Total Runs');
  });

  it('maps from_bat / bye / leg_bye to UiBall fields', () => {
    expect(
      noBallSelectionToUiFields({
        extraRuns: 2,
        noBallType: 'over_footed',
        noBallRunsType: 'from_bat',
      })
    ).toEqual({
      type: 'nb',
      noBallType: 'over_footed',
      noBallRunsType: 'from_bat',
      runsOffBat: 2,
    });

    expect(
      noBallSelectionToUiFields({
        extraRuns: 1,
        noBallType: 'over_heighten',
        noBallRunsType: 'bye',
      })
    ).toMatchObject({ type: 'nb', byeOnNoBall: true, extraRuns: 1 });

    expect(
      noBallSelectionToUiFields({
        extraRuns: 0,
        noBallType: 'field_restriction',
        noBallRunsType: 'leg_bye',
      })
    ).toMatchObject({ type: 'nb', legByeOnNoBall: true, extraRuns: 0 });
  });
});
