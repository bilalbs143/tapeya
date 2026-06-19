import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { NoBallFlash } from '../../primitives';

export default function FST_NO_BALL({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={NoBallFlash} isOverlay={isOverlay} bundle={bundle} />;
}
