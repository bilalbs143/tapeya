import { HighlightsPageBody } from '../ui/HighlightsPageBody';
import { useHighlightsPage } from '../ui/useHighlightsPage';

/** Highlights catalog; search ≥2 chars switches to compact list. */

export default function HighlightsPage() {
  const flow = useHighlightsPage();
  return <HighlightsPageBody flow={flow} />;
}
