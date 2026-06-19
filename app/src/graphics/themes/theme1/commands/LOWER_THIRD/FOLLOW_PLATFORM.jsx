import { PlatformPromoLTBar } from '../../layouts/bars/PlatformPromoLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function FOLLOW_PLATFORM({ isOverlay, headline, url, logoUrl }) {
  return (
    <BroadcastShell stage="bar">
      <PlatformPromoLTBar
        headline={headline}
        url={url}
        logoUrl={logoUrl}
        defaultHeadline="FOR BALL BY BALL UPDATES FOLLOW"
        defaultUrl="tapeya.com"
        edgeToEdge={isOverlay}
      />
    </BroadcastShell>
  );
}
