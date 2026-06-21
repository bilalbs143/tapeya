import { PlatformPromoLTBar } from '../../layouts/bars/PlatformPromoLTBar';
import { BroadcastShell } from '../../primitives/BroadcastShell';

export default function DOWNLOAD_PLATFORM({ isOverlay, headline, url, logoUrl }) {
  return (
    <BroadcastShell stage="bar" overlayInset="wide" isOverlay={isOverlay}>
      <PlatformPromoLTBar
        headline={headline}
        url={url}
        logoUrl={logoUrl}
        defaultHeadline="FOR BALL BY BALL UPDATES DOWNLOAD"
        defaultUrl="Tapeya App"
        edgeToEdge={isOverlay}
      />
    </BroadcastShell>
  );
}
