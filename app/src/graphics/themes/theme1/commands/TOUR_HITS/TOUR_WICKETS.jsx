import { toTourHitBundle } from '../../adapters/scoreBar.adapter';
import { TourHitsMiniBar } from '../../layouts/bars/TourHitsMiniBar';
import { ControllerBar } from '../../primitives';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function TOUR_WICKETS({ isOverlay, tokens, ...props }) {
  const bundle = toTourHitBundle(props, tokens);
  if (!bundle) return null;
  const { frame, teams, match } = bundle;

  return (
    <BroadcastShell stage="bar">
      <div className="bc-controller-stacked flex w-full max-w-full flex-col items-start">
        <TourHitsMiniBar mini={frame.mini} defaultTitle="WICKETS" edgeToEdge={isOverlay} />
        <ControllerBar edgeToEdge={isOverlay} frame={frame} teams={teams} match={match} barVariant="wickets" />
      </div>
    </BroadcastShell>
  );
}
