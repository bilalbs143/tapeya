import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ProfileStats } from '@/components/UserProfileTabs/ProfileStats';
import { Container } from '@/ui/Container';

/**
 * Career stats for the signed-in user — filters, highlights, batting / bowling / fielding.
 */
export default function Stats() {
  return (
    <div className="bg-black">
      <AppSubpageHeader title="Stats" />
      <Container className="pb-6">
        <ProfileStats />
      </Container>
    </div>
  );
}
