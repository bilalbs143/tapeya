import { toNeedTargetBundle } from '../../adapters/fullScreen.adapter';
import { NeedTargetGraphic } from '../../layouts/full-screen/NeedTargetGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function NEED_TARGET_FS({ tokens, ...props }) {
  const resolved = toNeedTargetBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <NeedTargetGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
