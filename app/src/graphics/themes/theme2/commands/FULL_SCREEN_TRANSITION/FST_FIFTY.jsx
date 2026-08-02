import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { FiftyUpFlash } from '../../primitives';

export default function FST_FIFTY({ event = null }) {
  return <FstScoreBarTransition Flash={FiftyUpFlash} event={event} />;
}
