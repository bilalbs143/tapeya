import { toPartnershipListBundle } from '../../adapters/fullScreen.adapter';
import { PartnershipListGraphic } from '../../layouts/full-screen/PartnershipListGraphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function PARTNERSHIP_LIST({ tokens, ...props }) {
  const resolved = toPartnershipListBundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <PartnershipListGraphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
