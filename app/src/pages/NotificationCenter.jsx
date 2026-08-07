import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { isSafeNotificationNavigatePath, normalizeAppPath } from '@/lib/deepLinks/deepLinkRegistry';
import { formatRelativeDate } from '@/lib/utils/dateUtils';
import { getInitials } from '@/lib/utils/displayUtils';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Container } from '@/ui/Container';

const PAGE_SIZE = 10;
const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayGroupLabel(createdAt) {
  if (!createdAt) return 'Earlier';
  const t = startOfLocalDay(createdAt);
  const today = startOfLocalDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;
  if (t === today) return 'Today';
  if (t === yesterday) return 'Yesterday';
  return 'Earlier';
}

/**
 * Maps a raw API notification to the shape expected by NotificationCard.
 * Message format expected: "Kind: detail text" → detail as body, kind next to time.
 */
function mapApiNotificationToCard(notification) {
  if (!notification) return null;

  const data = notification.data || {};
  const rawMessage = typeof data.message === 'string' ? data.message.trim() : '';
  const type = notification.type || data.type || null;

  let message = rawMessage || 'Notification';
  let kind = null;

  const colon = rawMessage.indexOf(':');
  if (colon > 0) {
    kind = rawMessage.slice(0, colon).trim() || null;
    const detail = rawMessage.slice(colon + 1).trim();
    if (detail) message = detail;
  }

  const nameSource = data.actor_name || data.customer_name || data.user_name || data.tournament_name || '';
  const fallback = nameSource ? getInitials(nameSource) : 'N';
  const avatar = data.actor_avatar_url || data.avatar_url || null;

  let href = null;
  if (typeof data.deep_link === 'string' && data.deep_link) {
    const path = normalizeAppPath(data.deep_link);
    if (isSafeNotificationNavigatePath(path) && path !== '/notification-center') {
      href = path;
    }
  } else if (data.vendor_order_id) {
    const path = `/seller/orders/${data.vendor_order_id}`;
    if (isSafeNotificationNavigatePath(path)) {
      href = path;
    }
  } else if (data.order_id) {
    const path = `/shop/orders/${data.order_id}`;
    if (isSafeNotificationNavigatePath(path)) {
      href = path;
    }
  } else if (data.actor_id && (type === 'user_followed' || type === 'user_referred')) {
    href = `/reels/u/${data.actor_id}`;
  }

  return {
    id: notification.id,
    type,
    avatar,
    fallback,
    message,
    kind,
    createdAt: notification.created_at ?? null,
    timestamp: notification.created_at ? formatRelativeDate(notification.created_at) : '',
    unread: !notification.read_at,
    href,
  };
}

function groupNotifications(notifications) {
  /** @type {Array<{ label: string, items: typeof notifications }>} */
  const groups = [];
  const indexByLabel = new Map();

  notifications.forEach((item) => {
    const label = dayGroupLabel(item.createdAt);
    let group = indexByLabel.get(label);
    if (!group) {
      group = { label, items: [] };
      indexByLabel.set(label, group);
      groups.push(group);
    }
    group.items.push(item);
  });

  return groups;
}

function NotificationSkeleton() {
  return (
    <ul className="flex flex-col gap-1.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="bg-surface/70 flex animate-pulse items-center gap-2.5 rounded-xl px-2.5 py-2">
          <div className="h-9 w-9 shrink-0 rounded-full bg-white/8" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-[78%] rounded bg-white/8" />
            <div className="h-2.5 w-[34%] rounded bg-white/6" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function NotificationCard({ notification, onOpen }) {
  const { avatar, fallback, message, kind, timestamp, unread } = notification;
  const interactive = Boolean(onOpen);

  return (
    <article
      className={`bg-surface flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${
        interactive ? 'cursor-pointer active:bg-white/5' : ''
      }`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${message}${unread ? ', unread' : ''}`}
      onClick={interactive ? () => onOpen(notification) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(notification);
              }
            }
          : undefined
      }
    >
      <Avatar className="h-9 w-9 shrink-0 rounded-full bg-white/8">
        <AvatarImage src={avatar || defaultAvatar} alt="" className="object-cover" />
        <AvatarFallback className="bg-white/10 text-[11px] font-semibold text-white/80">{fallback}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-[1.35] text-white/90">{message}</p>
        <p className="text-muted mt-0.5 text-[10px]">
          {timestamp}
          {kind ? <span aria-hidden> · </span> : null}
          {kind ? <span className="text-brand">{kind}</span> : null}
        </p>
      </div>

      {unread ? <span className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden /> : null}
    </article>
  );
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [markAllError, setMarkAllError] = useState(false);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNotificationsQuery({
    page,
    per_page: PAGE_SIZE,
  });

  const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();

  // Merge incoming page data into `items`, deduplicating by id.
  // Page 1 refetches update the top of the list without discarding loaded pages.
  useEffect(() => {
    if (!apiResponse?.data) return;

    setItems((prev) => {
      if (page === 1) {
        if (prev.length === 0) return apiResponse.data;
        const page1Ids = new Set(apiResponse.data.map((n) => n.id));
        return [...apiResponse.data, ...prev.filter((n) => !page1Ids.has(n.id))];
      }
      const existingIds = new Set(prev.map((n) => n.id));
      return [...prev, ...apiResponse.data.filter((n) => !existingIds.has(n.id))];
    });
  }, [apiResponse, page]);

  const notifications = useMemo(
    () =>
      items
        .map(mapApiNotificationToCard)
        .filter(Boolean)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
    [items],
  );

  const groups = useMemo(() => groupNotifications(notifications), [notifications]);
  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);
  const hasMoreOlder = (apiResponse?.meta?.current_page ?? 0) < (apiResponse?.meta?.last_page ?? 0);

  const loadOlder = () => {
    if (!hasMoreOlder || isFetching) return;
    setPage((prev) => prev + 1);
  };

  const markLocalRead = (id) => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at || now } : n)));
  };

  const handleOpen = async (notification) => {
    if (notification.unread) {
      markLocalRead(notification.id);
      try {
        await markNotificationRead(notification.id).unwrap();
      } catch {
        // Keep optimistic read; list tag invalidation can reconcile later.
      }
    }
    if (notification.href) {
      navigate(notification.href);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setMarkAllError(false);
    try {
      await markAllNotificationsRead().unwrap();
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || now })));
    } catch {
      setMarkAllError(true);
    }
  };

  return (
    <div className="min-h-full bg-black">
      <AppSubpageHeader sticky title="Notifications" titleClassName="normal-case" />

      <Container className="pb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-muted text-[11px]">
            {isLoading && items.length === 0
              ? 'Loading…'
              : unreadCount > 0
                ? `${unreadCount} unread`
                : notifications.length > 0
                  ? 'You’re all caught up'
                  : 'Inbox'}
          </p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-brand shrink-0 text-[11px] font-semibold transition-opacity active:opacity-80 disabled:opacity-50"
            >
              {isMarkingAll ? 'Marking…' : 'Mark All Read'}
            </button>
          ) : null}
        </div>

        {(isError || markAllError) && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2">
            <p className="text-[11px] text-red-300">{isError ? 'Couldn’t load notifications.' : 'Couldn’t mark all as read.'}</p>
            {isError ? (
              <button type="button" onClick={() => refetch()} className="text-[11px] font-semibold text-white underline">
                Retry
              </button>
            ) : null}
          </div>
        )}

        {isLoading && items.length === 0 ? <NotificationSkeleton /> : null}

        {!isLoading && notifications.length === 0 && !isError ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white/6 ring-1 ring-white/10">
              <svg
                className="text-muted h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path
                  d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-white">No Notifications Yet</p>
            <p className="text-muted mt-1 max-w-[16rem] text-[12px] leading-relaxed">
              Likes, comments, follows, and order updates will show up here.
            </p>
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="flex flex-col gap-3.5" aria-label="Notifications">
            {groups.map((group) => (
              <section key={group.label} aria-labelledby={`notif-group-${group.label}`}>
                <h2
                  id={`notif-group-${group.label}`}
                  className="text-muted mb-1.5 px-0.5 text-[10px] font-bold tracking-wide uppercase"
                >
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {group.items.map((notification) => (
                    <li key={notification.id}>
                      <NotificationCard
                        notification={notification}
                        onOpen={notification.href || notification.unread ? handleOpen : undefined}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}

        {hasMoreOlder ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={isFetching}
              className="text-muted inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold transition-colors hover:text-white disabled:opacity-50"
            >
              {isFetching ? 'Loading…' : 'View Older'}
              {!isFetching ? (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </button>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
