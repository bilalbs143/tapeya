import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { SixFlash } from '../../primitives';

export default function FST_SIX({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={SixFlash} isOverlay={isOverlay} bundle={bundle} />;
}
