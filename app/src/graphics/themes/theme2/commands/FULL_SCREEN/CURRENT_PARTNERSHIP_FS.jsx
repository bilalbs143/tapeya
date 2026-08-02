import { toPartnershipBundle } from '../../adapters/fullScreen.adapter';
import { CurrentPartnershipGraphic } from '../../layouts/full-screen/CurrentPartnershipGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function CURRENT_PARTNERSHIP_FS({ tokens, ...props }) {
  const resolved = toPartnershipBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <CurrentPartnershipGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
