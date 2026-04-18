import { ProfileAvatar } from '@/components/ProfileAvatar';
import { calculateProfileStrength } from '@/lib/profileStrength';
import { Progress } from '@/ui/Progress';

const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;
const profileHeaderBg = `${CLOUDFRONT_APP_BASE}/images/standard/profile-header.jpg`;

const BANNER_HEIGHT = 202;
const CONTENT_MAX = 'max-w-[1100px]';

/** Primary role label for display (e.g. "Player" → "PLAYER"). */
function getPrimaryRoleLabel(user) {
  const roles = user?.roles;
  if (!roles?.length) return 'MEMBER';
  const first = roles[0];
  const label = first?.name ?? first?.slug ?? '';
  return label ? label.toUpperCase().replace(/-/g, ' ') : 'MEMBER';
}

export function ProfileHeader({
  user: userProp,
  name: nameProp,
  role: roleProp,
  strength: strengthProp,
  avatarSrc: avatarSrcProp,
}) {
  const name =
    nameProp ??
    (userProp?.name?.trim() || userProp?.nickname?.trim() || 'Guest');
  const role = roleProp ?? getPrimaryRoleLabel(userProp);
  const avatarSrc = avatarSrcProp ?? userProp?.avatar_url ?? defaultAvatar;
  const strength =
    strengthProp ?? (userProp ? calculateProfileStrength(userProp) : 0);
  const showStrengthBar = strength < 100;

  return (
    <header
      className="relative isolate mb-6 overflow-visible"
      style={{ height: BANNER_HEIGHT }}
    >
      <img
        src={profileHeaderBg}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#000000] to-[#00000073]" />

      <div className="relative flex h-full flex-col px-4 pt-16">
        <div className={`mx-auto flex w-full flex-1 ${CONTENT_MAX} flex-col`}>
          <div className="flex flex-1 items-end justify-between gap-4">
            <div
              className={
                showStrengthBar
                  ? 'relative min-w-0 flex-1 pb-10'
                  : 'min-w-0 flex-1'
              }
            >
              <div
                className={`flex flex-col items-start gap-1.5 ${
                  showStrengthBar ? '' : 'translate-y-[25%]'
                }`}
              >
                <h1 className="max-w-full truncate text-base font-semibold tracking-tight text-white">
                  {name}
                </h1>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-black">
                  {role}
                </span>
              </div>
              {showStrengthBar && (
                <div className="absolute bottom-[-22px] left-0 z-0 w-full max-w-[358px] rounded-full bg-[#141412] px-4 py-3 backdrop-blur">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[13px] text-[#A2A6AB]">
                      Your Profile Strength
                    </span>
                    <div className="flex flex-1 items-center gap-3">
                      <Progress
                        value={strength}
                        className="h-2 flex-1 bg-white/20"
                        indicatorClassName="bg-[#d8a11e]"
                      />
                      <span className="shrink-0 text-sm font-bold text-white italic">
                        {strength}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 shrink-0">
              <ProfileAvatar src={avatarSrc} name={name} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
