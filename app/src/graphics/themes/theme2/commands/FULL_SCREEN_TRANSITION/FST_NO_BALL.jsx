import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { NoBallFlash } from '../../primitives';

export default function FST_NO_BALL({ event = null }) {
  return <FstScoreBarTransition Flash={NoBallFlash} event={event} />;
}
