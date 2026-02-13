import { ProfileHeader } from '@/components/ProfileHeader';
import { UserProfileTabs } from '@/components/UserProfileTabs';

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-black">
      <ProfileHeader />

      <div className="px-4 pt-10 pb-6">
        <UserProfileTabs />
      </div>
    </div>
  );
}
