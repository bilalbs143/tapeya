import { OfficialBadge } from '@/components/OfficialBadge';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { NAVBAR_HERO_CONTROL_OFFSET } from '@/lib/constants/layout';
import { calculateProfileStrength } from '@/lib/utils/playerUtils';
import { Progress } from '@/ui/Progress';

const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;
const profileHeaderBg = `${CLOUDFRONT_APP_BASE}/images/standard/profile-header.jpg`;

const BANNER_HEIGHT = 202;
const CONTENT_MAX = 'max-w-[1100px]';

/**
 * Profile cover — banner, avatar, name, optional strength pill or nickname under the name, share.
 */
export function ProfileHeader({ user: userProp, name: nameProp, strength: strengthProp, avatarSrc: avatarSrcProp, onShare }) {
  const name = nameProp ?? (userProp?.name?.trim() || userProp?.nickname?.trim() || 'Guest');
  const nickname = userProp?.nickname?.trim() || '';
  const avatarSrc = avatarSrcProp ?? userProp?.avatar_url ?? defaultAvatar;
  const strength = strengthProp ?? (userProp ? calculateProfileStrength(userProp) : 0);
  const showStrengthBar = strength < 100;
  const showNickname = !showStrengthBar && Boolean(nickname);
  const isOfficial = Boolean(userProp?.is_official);

  return (
    <header
      className="relative isolate mb-6 overflow-visible"
      style={{ height: `calc(${BANNER_HEIGHT}px + env(safe-area-inset-top, 0px))` }}
    >
      <img src={profileHeaderBg} alt="" className="absolute inset-0 -z-20 size-full object-cover object-center" />
      {/* Soft top wash for share control; heavy bottom shadow fading upward into the page */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/75 to-transparent" />

      {onShare ? (
        <button
          type="button"
          onClick={onShare}
          aria-label="Share Profile"
          className="absolute right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition-opacity hover:opacity-80 active:opacity-60"
          style={{ top: NAVBAR_HERO_CONTROL_OFFSET }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      ) : null}

      <div className="relative flex h-full flex-col px-4" style={{ paddingTop: NAVBAR_HERO_CONTROL_OFFSET }}>
        <div className={`mx-auto flex w-full flex-1 ${CONTENT_MAX} flex-col`}>
          <div className="flex flex-1 items-end justify-between gap-4">
            <div className="relative z-10 shrink-0">
              <ProfileAvatar src={avatarSrc} name={name} />
            </div>

            <div className={showStrengthBar ? 'relative min-w-0 flex-1 pb-10' : 'min-w-0 flex-1'}>
              <div className={showStrengthBar ? '' : 'translate-y-[25%]'}>
                <h1 className="inline-flex max-w-full items-center gap-1.5 text-[17px] font-semibold tracking-tight text-white sm:text-lg">
                  <span className="truncate">{name}</span>
                  <OfficialBadge isOfficial={isOfficial} size="md" />
                </h1>
                {showNickname ? <p className="text-muted mt-0.5 truncate text-[13px] font-medium">@{nickname}</p> : null}
              </div>

              {showStrengthBar ? (
                <div className="bg-surface absolute bottom-[-22px] left-0 z-0 w-full max-w-[358px] rounded-full border border-white/[0.06] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-muted shrink-0 text-[12px] font-medium sm:text-[13px]">Profile Strength</span>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Progress value={strength} className="h-2 flex-1 bg-white/15" indicatorClassName="bg-brand" />
                      <span className="text-brand shrink-0 text-sm font-bold tabular-nums">{strength}%</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
