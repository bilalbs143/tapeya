import { describe, expect, it } from 'vitest';

import type { BallLogInnings } from './ballLog';
import { ballLogToCommentary } from './commentary';

const sample: BallLogInnings[] = [
  {
    id: 1,
    inningsNumber: 1,
    status: 'in_progress',
    battingTeamName: 'CBC',
    sideShort: 'CBC',
    canEdit: false,
    overs: [
      {
        n: 18,
        runs: 5,
        wickets: 0,
        bowler: 'Karim',
        inProgress: true,
        entries: [
          {
            id: 10,
            overNumber: 18,
            ballInOver: 1,
            token: 'WD',
            chip: 'wd',
            label: 'Wide',
            by: 'R. Karim',
            on: 'N. Haque',
            zone: null,
            detail: 'R. Karim to N. Haque',
            editable: true,
            runs: 1,
            extra: 'wd',
            kind: 'wd',
            snapshot: {
              kind: 'wd',
              runsOffBat: 0,
              runs: 1,
              penaltyRuns: 0,
              additionalRuns: 0,
              noBallType: null,
              noBallRunsType: null,
            },
          },
          {
            id: 11,
            overNumber: 18,
            ballInOver: 2,
            token: '4',
            chip: '4',
            label: 'Four',
            by: 'R. Karim',
            on: 'N. Haque',
            zone: 'cover',
            detail: 'R. Karim to N. Haque',
            editable: true,
            runs: 4,
            extra: null,
            kind: 'runs',
            snapshot: {
              kind: 'runs',
              runsOffBat: 4,
              runs: 4,
              penaltyRuns: 0,
              additionalRuns: 0,
              noBallType: null,
              noBallRunsType: null,
            },
          },
        ],
      },
    ],
  },
];

describe('ballLogToCommentary', () => {
  it('flattens overs into forward commentary rows', () => {
    const items = ballLogToCommentary(sample);
    expect(items).toHaveLength(2);
    expect(items[0]?.ball).toBe('18.1');
    expect(items[1]?.ball).toBe('18.2');
    expect(items[1]?.text).toContain('four');
  });
});
