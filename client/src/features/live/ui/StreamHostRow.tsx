import { Link } from 'react-router-dom';

import { UserAvatar, userProfilePath } from '@/entities/user';

import { VerifiedBadge } from '@/shared/ui/Badge';

import { type LiveHost, PLATFORM_HOST_AVATAR } from '../model/schemas';

type StreamHostRowProps = {
  host: LiveHost;
  isLive?: boolean | undefined;
  title?: string | undefined;
  description?: string | undefined;
  /** Watch: link to broadcaster; hub cards: false (row already inside stream link). */
  linkProfile?: boolean | undefined;
};

/** Brand-ring Tapeya mark for admin / match streams without a self-serve broadcaster. */
function PlatformAvatar() {
  return (
    <span className="bg-brand inline-flex shrink-0 rounded-full p-0.5">
      <span className="border-surface bg-media-ink grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2">
        <img src={PLATFORM_HOST_AVATAR} alt="" className="h-full w-full object-contain p-1" draggable={false} />
      </span>
    </span>
  );
}

/** Stream host row — avatar, live label, optional title/description. */
export function StreamHostRow({ host, isLive = false, title, description, linkProfile = false }: StreamHostRowProps) {
  const streamTitle = title?.trim() || '';
  const detail = description?.trim() || '';
  const showDetail = Boolean(detail) && detail !== streamTitle;
  const profileHref =
    linkProfile && !host.isPlatform && host.id != null
      ? userProfilePath({ id: host.id, nickname: host.nickname })
      : undefined;

  const name = (
    <>
      <span className="font-bold">{host.name}</span>
      {isLive ? <span className="text-muted font-normal"> is live now</span> : null}
    </>
  );

  return (
    <div className="flex items-start gap-3">
      {host.isPlatform ? (
        <PlatformAvatar />
      ) : (
        <span className="bg-brand inline-flex shrink-0 rounded-full p-0.5">
          <UserAvatar
            user={{ name: host.name, avatarUrl: host.avatarUrl }}
            size="md"
            to={profileHref}
            className="border-surface w-9 border-2 bg-surface-raised"
          />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          {profileHref ? (
            <Link to={profileHref} onClick={(e) => e.stopPropagation()} className="truncate text-sm text-ink">
              {name}
            </Link>
          ) : (
            <p className="truncate text-sm text-ink">{name}</p>
          )}
          <VerifiedBadge isOfficial={host.isOfficial} size="sm" className="shrink-0" />
        </div>
        {streamTitle ? <p className="text-muted mt-0.5 truncate text-2xs leading-snug">{streamTitle}</p> : null}
        {showDetail ? <p className="text-dim mt-1 line-clamp-2 text-2xs leading-snug">{detail}</p> : null}
      </div>
    </div>
  );
}
