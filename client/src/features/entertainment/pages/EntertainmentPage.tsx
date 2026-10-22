import { EntertainmentPageBody } from '../ui/EntertainmentPageBody';
import { useEntertainmentPage } from '../ui/useEntertainmentPage';

/** Entertainment hub — poster grid; search ≥2 chars → compact list. */
export default function EntertainmentPage() {
  const flow = useEntertainmentPage();
  return <EntertainmentPageBody flow={flow} />;
}
