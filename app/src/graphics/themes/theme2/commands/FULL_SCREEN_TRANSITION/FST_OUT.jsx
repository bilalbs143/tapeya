import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { WicketFlash } from '../../primitives';

export default function FST_OUT({ event = null }) {
  return <FstScoreBarTransition Flash={WicketFlash} event={event} />;
}
