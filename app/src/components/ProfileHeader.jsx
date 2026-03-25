import goldMemberIcon from '@/assets/images/icons/gold-member.png';
import defaultAvatar from '@/assets/images/standard/player-avatar.png';
import profileHeaderBg from '@/assets/images/standard/profile-header.jpg';
import { calculateProfileStrength } from '@/lib/profileStrength';
import { Progress } from '@/ui/Progress';

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
  membership = 'GOLD MEMBER',
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
  return (
    <header className="relative isolate" style={{ height: BANNER_HEIGHT }}>
      <img
        src={profileHeaderBg}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#000000] to-[#00000073]" />

      <div className="relative flex h-full flex-col px-4 pt-16">
        <div className={`mx-auto flex w-full flex-1 ${CONTENT_MAX} flex-col`}>
          <div className="flex flex-1 items-end justify-between gap-4">
            <div className="flex min-w-0 items-start gap-2 pb-6">
              <img src={goldMemberIcon} alt="" className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-base font-semibold tracking-tight text-white">
                    {name}
                  </h1>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-black">
                    {role}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#DA9811]">{membership}</p>
              </div>
            </div>
            <img
              src={avatarSrc}
              alt={name}
              className="w-20 shrink-0 rounded-2xl object-cover shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:block"
            />
          </div>

          <div className="absolute right-0 bottom-[-22px] left-0 mx-auto w-full max-w-[358px] rounded-full bg-[#141412] px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#A2A6AB]">
                Your profile strength
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
        </div>
      </div>
    </header>
  );
}
