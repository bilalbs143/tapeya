import { describe, expect, it } from 'vitest';

import { resolveBatsmanPickerDialogOptions, resolveBowlerPickerDialogOptions } from '../scoringDialogMode';

describe('resolveBatsmanPickerDialogOptions', () => {
  it('uses picker when Playing XI is saved before the first ball (e.g. 2nd innings)', () => {
    const mode = resolveBatsmanPickerDialogOptions({
      hasBallsBowled: false,
      battingXiSavedOnApi: true,
    });

    expect(mode).toEqual({
      squadSetup: false,
      variant: 'picker',
      hideSquadSetup: true,
      declareSquadMode: false,
    });
  });

  it('uses squad declare flow when XI is not saved yet', () => {
    const mode = resolveBatsmanPickerDialogOptions({
      hasBallsBowled: false,
      battingXiSavedOnApi: false,
    });

    expect(mode.squadSetup).toBe(true);
    expect(mode.variant).toBe('squad');
    expect(mode.hideSquadSetup).toBe(false);
  });

  it('uses picker after wickets even with no balls in a new innings segment', () => {
    const mode = resolveBatsmanPickerDialogOptions({
      hasBallsBowled: false,
      battingXiSavedOnApi: true,
      afterWicket: true,
    });

    expect(mode.variant).toBe('picker');
    expect(mode.hideSquadSetup).toBe(true);
  });
});

describe('resolveBowlerPickerDialogOptions', () => {
  it('uses picker when bowling XI is saved before the first ball', () => {
    const mode = resolveBowlerPickerDialogOptions({
      hasBallsBowled: false,
      bowlingXiSavedOnApi: true,
      battingXiSavedOnApi: true,
    });

    expect(mode.variant).toBe('picker');
    expect(mode.hideSquadSetup).toBe(true);
    expect(mode.squadSetup).toBe(false);
  });

  it('keeps declare-squad wizard for bowling when batting XI exists but bowling XI does not', () => {
    const mode = resolveBowlerPickerDialogOptions({
      hasBallsBowled: false,
      bowlingXiSavedOnApi: false,
      battingXiSavedOnApi: true,
    });

    expect(mode.inWizard).toBe(true);
    expect(mode.squadSetup).toBe(true);
    expect(mode.hideSquadSetup).toBe(false);
  });
});
