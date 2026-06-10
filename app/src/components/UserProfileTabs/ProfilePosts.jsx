import { CONTENT_MAX_WIDTH } from '@/lib/constants/profile';

export function ProfilePosts() {
  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      <p className="text-center text-sm text-white/60">Posts — user activity and content.</p>
    </div>
  );
}
