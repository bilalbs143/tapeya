/**
 * ScoringBatsmanPickerDialog — body-only (DialogManager provides the BaseDialog wrapper).
 * Branches between MatchPlayerPickerDialog (XI already saved on API) and
 * ScoringSquadPlayerPickerDialog (squad setup mode, pick playing XI first).
 */
import MatchPlayerPickerDialog from './MatchPlayerPickerDialog';
import ScoringSquadPlayerPickerDialog from './ScoringSquadPlayerPickerDialog';

export function ScoringBatsmanPickerDialog({ variant, ...rest }) {
  if (variant === 'picker') {
    return <MatchPlayerPickerDialog variant="batsman" {...rest} />;
  }
  return <ScoringSquadPlayerPickerDialog variant="batsman" {...rest} />;
}
