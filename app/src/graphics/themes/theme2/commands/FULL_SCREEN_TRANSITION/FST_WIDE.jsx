import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { WideFlash } from '../../primitives';

export default function FST_WIDE({ event = null }) {
  return <FstScoreBarTransition Flash={WideFlash} event={event} />;
}
