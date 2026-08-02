import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { DecisionPendingFlash } from '../../primitives';

export default function FST_DECISION({ event = null }) {
  return <FstScoreBarTransition Flash={DecisionPendingFlash} event={event} />;
}
