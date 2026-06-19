import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { NotOutFlash } from '../../primitives';

export default function FST_NOT_OUT({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={NotOutFlash} isOverlay={isOverlay} bundle={bundle} />;
}
