import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { SixFlash } from '../../primitives';

export default function FST_SIX({ event = null }) {
  return <FstScoreBarTransition Flash={SixFlash} event={event} />;
}
