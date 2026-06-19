import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { WideFlash } from '../../primitives';

export default function FST_WIDE({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={WideFlash} isOverlay={isOverlay} bundle={bundle} />;
}
