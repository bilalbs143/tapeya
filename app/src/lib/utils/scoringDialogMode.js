/**
 * Dialog mode for batsman/bowler pickers during live scoring.
 * Squad management UI is only shown when the Playing XI is not yet saved on the API.
 */

/**
 * @param {{
 *   hasBallsBowled: boolean,
 *   battingXiSavedOnApi: boolean,
 *   replaceStriker?: boolean,
 *   afterWicket?: boolean,
 * }} params
 */
export function resolveBatsmanPickerDialogOptions({
  hasBallsBowled,
  battingXiSavedOnApi,
  replaceStriker = false,
  afterWicket = false,
}) {
  const squadSetup = !hasBallsBowled && !battingXiSavedOnApi && !replaceStriker && !afterWicket;

  return {
    squadSetup,
    variant: squadSetup ? 'squad' : 'picker',
    hideSquadSetup: !squadSetup,
    declareSquadMode: squadSetup,
  };
}

/**
 * @param {{
 *   hasBallsBowled: boolean,
 *   bowlingXiSavedOnApi: boolean,
 *   battingXiSavedOnApi: boolean,
 *   replaceActive?: boolean,
 *   wizardStep?: number|null,
 * }} params
 */
export function resolveBowlerPickerDialogOptions({
  hasBallsBowled,
  bowlingXiSavedOnApi,
  battingXiSavedOnApi,
  replaceActive = false,
  wizardStep = null,
}) {
  const squadSetup = !hasBallsBowled && !bowlingXiSavedOnApi && !replaceActive;
  const inWizard = squadSetup && (wizardStep === 2 || (battingXiSavedOnApi && !bowlingXiSavedOnApi));

  return {
    squadSetup,
    inWizard,
    variant: squadSetup ? 'squad' : 'picker',
    hideSquadSetup: !squadSetup,
    declareSquadMode: inWizard,
  };
}
