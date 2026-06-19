import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { ReplayFlash } from '../../primitives';

export default function FST_REPLAY({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={ReplayFlash} isOverlay={isOverlay} bundle={bundle} />;
}
