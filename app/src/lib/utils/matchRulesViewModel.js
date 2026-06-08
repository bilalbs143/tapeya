const DASH = '—';

/**
 * Read-only match rules reference for the scoring Action menu.
 * Derived from match config — no separate rules API yet.
 *
 * @param {object|null|undefined} match  UI match from `apiMatchToUiMatchConfig`
 * @returns {{ dialogTitle: string, sections: Array<{ id: string, title: string, defaultOpen: boolean, rows: Array<{ label: string, value: string }> }> }}
 */
export function buildMatchRulesViewModel(match) {
  const overs = match?.overs != null && match.overs !== '' ? String(match.overs) : null;
  const playersPerSide = match?.playersPerSide != null ? String(match.playersPerSide) : null;
  const ruleName = overs ? `${overs} Over Limited` : 'Limited Over';

  return {
    dialogTitle: 'Limited Over',
    sections: [
      {
        id: 'basic',
        title: 'Basic Profile',
        defaultOpen: true,
        rows: [
          { label: 'Rule Name', value: ruleName },
          { label: 'Players Per Team', value: playersPerSide ?? DASH },
          { label: 'Overs Per Innings', value: overs ?? DASH },
          { label: 'Venue', value: match?.venue?.trim() || DASH },
        ],
      },
      {
        id: 'bowling',
        title: 'Bowling Rules',
        defaultOpen: false,
        rows: [
          { label: 'Innings Length', value: overs ? `${overs} overs maximum` : DASH },
          { label: 'Wide / No Ball', value: 'Re-bowled; do not count as a legal delivery' },
          { label: 'Over Count', value: 'Six legal balls complete one over' },
          { label: 'Penalty Runs', value: 'May be awarded to either side (Law 41)' },
        ],
      },
      {
        id: 'batting',
        title: 'Batting Rules',
        defaultOpen: false,
        rows: [
          { label: 'Squad Size', value: playersPerSide ? `${playersPerSide} players per side` : DASH },
          { label: 'Crease', value: 'Two batters on crease; tap row to swap striker' },
          { label: 'Strike Rotation', value: 'Odd runs and end of over swap striker' },
          { label: 'Retired Hurt', value: 'May resume if fit; does not count as a wicket' },
          { label: 'Retired Out', value: 'Counts as a wicket when leaving the crease' },
        ],
      },
      {
        id: 'wicket',
        title: 'Wicket Rules',
        defaultOpen: false,
        rows: [
          {
            label: 'Dismissals',
            value:
              'Bowled, caught, LBW, run out, stumped, hit wicket, obstructing the field, hit the ball twice, timed out, mankad',
          },
          {
            label: 'Free Hit',
            value: 'After a no-ball — only run out, obstructing the field, and hit the ball twice are valid dismissals',
          },
          { label: 'Combined Extras', value: 'Wide (wicket) and No ball (wicket) flows available from scoring controls' },
          { label: 'Wicket Summary', value: 'Review screen shown after each dismissal before continuing' },
        ],
      },
    ],
  };
}
