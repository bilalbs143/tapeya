import { LiveHubBody } from '../ui/LiveHubBody';
import { useLiveHub } from '../ui/useLiveHub';

/** Live hub — live streams only; polls every 60s. */
export default function LiveHubPage() {
  const flow = useLiveHub();
  return <LiveHubBody flow={flow} />;
}
