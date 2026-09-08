import { LiveStreamChip } from '@/components/live/LiveStreamChip';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { TapeyaPlatformAvatar } from '@/components/live/TapeyaPlatformAvatar';
import { OfficialBadge } from '@/components/OfficialBadge';
import { UserAvatar } from '@/components/UserAvatar';

/**
 * Live hub broadcast card — thumbnail + creator row (broadcaster or Tapeya) + stream title.
 * Host avatar does not nest a profile link; the parent card Link owns navigation.
 *
 * @param {{
 *   image?: string|null,
 *   title?: string,
 *   description?: string|null,
 *   host?: {
 *     name: string,
 *     avatarUrl?: string,
 *     isOfficial?: boolean,
 *     isPlatform?: boolean,
 *   }|null,
 *   isLive?: boolean,
 * }} props
 */
export function LiveEventCard({ image, title, description = null, host = null, isLive = false }) {
  const streamTitle = title?.trim() || '';
  const detail = description?.trim() || '';
  const showDetail = Boolean(detail) && detail !== streamTitle;

  return (
    <article className="bg-surface-border flex h-full flex-col overflow-hidden rounded-[20px]">
      <div className="relative w-full shrink-0">
        <LiveStreamThumbnail src={image} alt={streamTitle || host?.name || 'Live stream'} />
        {isLive ? <LiveStreamChip className="absolute top-3 left-3 z-10" /> : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        {host ? (
          <div className="flex items-start gap-3">
            {host.isPlatform ? (
              <TapeyaPlatformAvatar />
            ) : (
              <UserAvatar src={host.avatarUrl} name={host.name} size="xl" ring="brand" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1">
                <p className="truncate text-[14px] text-white">
                  <span className="font-bold">{host.name}</span>
                  {isLive ? <span className="font-normal text-white/80"> is live now</span> : null}
                </p>
                <OfficialBadge isOfficial={host.isOfficial} size="sm" />
              </div>
              {streamTitle ? <p className="text-muted mt-0.5 line-clamp-2 text-[12px] leading-snug">{streamTitle}</p> : null}
              {showDetail ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug wrap-break-word text-[#888888]">{detail}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {streamTitle ? (
              <h3 className="text-[14px] leading-snug font-bold wrap-break-word text-white">{streamTitle}</h3>
            ) : null}
            {showDetail ? <p className="mt-1 text-[12px] leading-snug wrap-break-word text-[#888888]">{detail}</p> : null}
          </>
        )}
      </div>
    </article>
  );
}
