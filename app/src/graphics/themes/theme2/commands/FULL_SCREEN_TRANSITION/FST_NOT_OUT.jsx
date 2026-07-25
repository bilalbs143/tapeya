import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { NotOutFlash } from '../../primitives';

export default function FST_NOT_OUT({ event = null }) {
  return <FstScoreBarTransition Flash={NotOutFlash} event={event} />;
}
