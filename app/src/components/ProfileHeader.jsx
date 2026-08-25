import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { NAVBAR_HERO_CONTROL_OFFSET } from '@/lib/constants/layout';
import { calculateProfileStrength } from '@/lib/utils/playerUtils';
import { Progress } from '@/ui/Progress';

const profileHeaderBg = `${CLOUDFRONT_APP_BASE}/images/standard/profile-header.jpg`;

const BANNER_HEIGHT = 140;
const CONTENT_MAX = 'max-w-[1100px]';

/**
 * Edit-profile cover — banner + full-width profile strength.
 */
export function ProfileHeader({ user: userProp, strength: strengthProp }) {
  const strength = strengthProp ?? (userProp ? calculateProfileStrength(userProp) : 0);

  return (
    <header
      className="relative isolate mb-8 overflow-visible"
      style={{ height: `calc(${BANNER_HEIGHT}px + env(safe-area-inset-top, 0px))` }}
    >
      <img src={profileHeaderBg} alt="" className="absolute inset-0 -z-20 size-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/75 to-transparent" />

      <div className="relative flex h-full flex-col px-4" style={{ paddingTop: NAVBAR_HERO_CONTROL_OFFSET }}>
        <div className={`relative mx-auto flex w-full flex-1 ${CONTENT_MAX} flex-col justify-end pb-2`}>
          <div className="bg-surface absolute right-0 bottom-[-22px] left-0 z-0 rounded-full border border-white/6 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-muted shrink-0 text-[12px] font-medium sm:text-[13px]">Profile Strength</span>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Progress value={strength} className="h-2 flex-1 bg-white/15" indicatorClassName="bg-brand" />
                <span className="text-brand shrink-0 text-sm font-bold tabular-nums">{strength}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
