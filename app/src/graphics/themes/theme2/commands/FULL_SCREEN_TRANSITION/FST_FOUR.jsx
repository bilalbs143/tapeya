import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { FourFlash } from '../../primitives';

export default function FST_FOUR({ event = null }) {
  return <FstScoreBarTransition Flash={FourFlash} event={event} />;
}
