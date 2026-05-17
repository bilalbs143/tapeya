/**
 * ScoringBowlerPickerDialog — body-only (DialogManager provides the BaseDialog wrapper).
 * Branches between MatchPlayerPickerDialog (XI already saved on API) and
 * ScoringSquadPlayerPickerDialog (squad setup mode, pick playing XI first).
 */
import MatchPlayerPickerDialog from './MatchPlayerPickerDialog';
import ScoringSquadPlayerPickerDialog from './ScoringSquadPlayerPickerDialog';

export function ScoringBowlerPickerDialog({ variant, ...rest }) {
  if (variant === 'picker') {
    return <MatchPlayerPickerDialog variant="bowler" {...rest} />;
  }
  return <ScoringSquadPlayerPickerDialog variant="bowler" {...rest} />;
}
