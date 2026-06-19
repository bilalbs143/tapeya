import { toScoreBarBundle } from '../../adapters/scoreBar.adapter';
import { FstScoreBarTransition } from '../../layouts/FstScoreBarTransition';
import { FourFlash } from '../../primitives';

export default function FST_FOUR({ isOverlay, tokens, ...props }) {
  const bundle = toScoreBarBundle(props, tokens);
  return <FstScoreBarTransition Flash={FourFlash} isOverlay={isOverlay} bundle={bundle} />;
}
