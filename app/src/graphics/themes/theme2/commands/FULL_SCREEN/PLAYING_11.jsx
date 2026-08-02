import { toPlaying11Bundle } from '../../adapters/fullScreen.adapter';
import { Playing11Graphic } from '../../layouts/full-screen/Playing11Graphic';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function PLAYING_11({ tokens, ...props }) {
  const resolved = toPlaying11Bundle(props, tokens);
  if (!resolved) return null;

  return (
    <BroadcastShell stage="full">
      <Playing11Graphic data={resolved.data} teams={resolved.teams} />
    </BroadcastShell>
  );
}
