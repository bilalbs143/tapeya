import { ScorecardHubBody } from '../ui/ScorecardHubBody';
import { useScorecardHub } from '../ui/useScorecardHub';

/** Fan scorecard hub — open-tournament fixtures. Fan scorecard hub (`/scorecard`); each card opens the public match centre. */

export default function ScorecardHubPage() {
  const flow = useScorecardHub();
  return <ScorecardHubBody flow={flow} />;
}
