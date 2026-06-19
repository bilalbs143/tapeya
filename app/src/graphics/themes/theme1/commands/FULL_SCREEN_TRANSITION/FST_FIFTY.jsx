import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { FiftyUpFlash } from '../../primitives';

export default function FST_FIFTY({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={FiftyUpFlash} isOverlay={isOverlay} bundle={bundle} />;
}
