import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { HundredUpFlash } from '../../primitives';

export default function FST_HUNDRED({ event = null }) {
  return <FstScoreBarTransition Flash={HundredUpFlash} event={event} />;
}
