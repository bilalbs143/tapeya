import { useNavigate } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';

import { ProfileStats } from '../ui/ProfileStats';

/** Signed-in career stats — same `ProfileStats` as the public profile Stats tab. */

export default function StatsPage() {
  const navigate = useNavigate();

  return (
    <PageDock header={<ScreenBar title="Stats" subtitle="Your Batting and Bowling" onBack={() => navigate(-1)} />}>
      <div className="px-4 pt-3.5 pb-6">
        <ProfileStats />
      </div>
    </PageDock>
  );
}
