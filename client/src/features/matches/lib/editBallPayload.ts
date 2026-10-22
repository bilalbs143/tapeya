/** Edit-ball form → PATCH /matches/:id/innings/:id/balls/:ballId body. UI shape matches EditBallDialog; wire fields follow UpdateBallRequest. */

export type EditBallExtra = 'wd' | 'nb' | 'b' | 'lb' | null;

export type EditBallFormPatch = {
  runs: number;
  extra: EditBallExtra;
  zone: string | null;
};

export type BallLogKind = 'runs' | 'wd' | 'nb' | 'bye' | 'lb' | 'penalty' | 'additional_runs' | 'wicket' | 'retired';

export type UpdateBallPayload = {
  runs_off_bat?: number | undefined;
  extra_runs?: number | undefined;
  is_wide?: boolean | undefined;
  is_no_ball?: boolean | undefined;
  is_bye?: boolean | undefined;
  is_leg_bye?: boolean | undefined;
  penalty_runs?: number | undefined;
  additional_runs?: number | undefined;
  shot_position?: string | null | undefined;
  no_ball_type?: string | null | undefined;
  no_ball_runs_type?: string | null | undefined;
};

export type EditableBallSnapshot = {
  kind: BallLogKind;
  runsOffBat: number;
  runs: number;
  penaltyRuns: number;
  additionalRuns: number;
  noBallType?: string | null | undefined;
  noBallRunsType?: string | null | undefined;
};

/** Primary runs value shown in the edit picker (extra runs or off-bat as appropriate). */

export function getBallEditableRunsValue(ball: EditableBallSnapshot): number {
  switch (ball.kind) {
    case 'runs':
      return ball.runsOffBat || ball.runs || 0;
    case 'bye':
    case 'lb':
      return ball.runs || 0;
    case 'wd':
      return Math.max(0, (ball.runs || 1) - 1);
    case 'nb':
      if (ball.noBallRunsType === 'bye' || ball.noBallRunsType === 'leg_bye') {
        return Math.max(0, (ball.runs || 1) - 1);
      }
      return ball.runsOffBat || Math.max(0, (ball.runs || 1) - 1);
    case 'penalty':
      return ball.penaltyRuns || 0;
    case 'additional_runs':
      return ball.additionalRuns || 0;
    default:
      return 0;
  }
}

export function getBallEditableExtra(kind: BallLogKind): EditBallExtra {
  switch (kind) {
    case 'wd':
      return 'wd';
    case 'nb':
      return 'nb';
    case 'bye':
      return 'b';
    case 'lb':
      return 'lb';
    default:
      return null;
  }
}

/** Build PATCH body for correcting a delivery. Penalty / additional-runs-only stay type-locked; everything else maps */

export function buildUpdateBallPayload(ball: EditableBallSnapshot, patch: EditBallFormPatch): UpdateBallPayload | null {
  const runs = Math.max(0, Math.min(255, Number(patch.runs) || 0));
  const zone = patch.zone;

  if (ball.kind === 'wicket' || ball.kind === 'retired') {
    return null;
  }

  if (ball.kind === 'penalty') {
    return {
      penalty_runs: runs,
      ...(zone !== undefined ? { shot_position: zone } : {}),
    };
  }

  if (ball.kind === 'additional_runs') {
    return {
      additional_runs: runs,
      ...(zone !== undefined ? { shot_position: zone } : {}),
    };
  }

  const base: UpdateBallPayload = {
    is_wide: false,
    is_no_ball: false,
    is_bye: false,
    is_leg_bye: false,
    shot_position: zone,
  };

  switch (patch.extra) {
    case 'wd':
      return { ...base, is_wide: true, runs_off_bat: 0, extra_runs: runs };
    case 'nb':
      return {
        ...base,
        is_no_ball: true,
        runs_off_bat: runs,
        extra_runs: 0,
        ...(ball.noBallType ? { no_ball_type: ball.noBallType } : {}),
        ...(ball.noBallRunsType ? { no_ball_runs_type: ball.noBallRunsType } : {}),
      };
    case 'b':
      return { ...base, is_bye: true, runs_off_bat: 0, extra_runs: runs };
    case 'lb':
      return { ...base, is_leg_bye: true, runs_off_bat: 0, extra_runs: runs };
    case null:
    default:
      return { ...base, runs_off_bat: runs, extra_runs: 0 };
  }
}
