import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { HundredUpFlash } from '../../primitives';

export default function FST_HUNDRED({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={HundredUpFlash} isOverlay={isOverlay} bundle={bundle} />;
}
