import { toTourHitBundle } from '../../adapters/scoreBar.adapter';
import { LowerThirdBar } from '../../layouts/bars/LowerThirdBar';
import { TourHitsMiniBar } from '../../layouts/bars/TourHitsMiniBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function TOUR_FIFTIES({ isOverlay, tokens, ...props }) {
  const bundle = toTourHitBundle(props, tokens);
  if (!bundle) return null;
  const { frame, teams, match } = bundle;

  return (
    <BroadcastShell stage="bar">
      <div className="bc-controller-stacked flex w-full max-w-full flex-col items-start">
        <TourHitsMiniBar mini={frame.mini} defaultTitle="FIFTIES" edgeToEdge={isOverlay} />
        <LowerThirdBar tokens={tokens} edgeToEdge={isOverlay} frame={frame} teams={teams} match={match} barVariant="fifties" />
      </div>
    </BroadcastShell>
  );
}
