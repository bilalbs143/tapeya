import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { ReplayFlash } from '../../primitives';

export default function FST_REPLAY({ event = null }) {
  return <FstScoreBarTransition Flash={ReplayFlash} event={event} />;
}
