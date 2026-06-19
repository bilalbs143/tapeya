import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { WicketFlash } from '../../primitives';

export default function FST_OUT({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={WicketFlash} isOverlay={isOverlay} bundle={bundle} />;
}
