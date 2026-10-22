import { DiscoverPageBody } from '../ui/DiscoverPageBody';
import { useDiscoverPage } from '../ui/useDiscoverPage';

export default function DiscoverPage() {
  const flow = useDiscoverPage();
  return <DiscoverPageBody flow={flow} />;
}
