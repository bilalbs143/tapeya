import { toInningFiguresBundle } from '../../adapters/fullScreen.adapter';
import { InningFiguresGraphic } from '../../layouts/full-screen/InningFiguresGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function INNING_FIGURES({ tokens, ...props }) {
  const resolved = toInningFiguresBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <InningFiguresGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
