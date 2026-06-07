import { useEffect, useMemo, useState } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation } from '@/store/api/notificationApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Container } from '@/ui/Container';

const PAGE_SIZE = 10;

const ChevronDown = () => (
  <svg
    className="h-4 w-4 text-[#A2A6AB]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/**
 * Maps a raw API notification to the shape expected by NotificationCard.
 * Message format expected: "Bold label: remaining detail text"
 */
function mapApiNotificationToCard(notification) {
  if (!notification) return null;

  const data = notification.data || {};
  const rawMessage = typeof data.message === 'string' ? data.message : '';

  let boldText = 'Notification';
  let regularText = '';

  if (rawMessage) {
    const [firstPart, ...rest] = rawMessage.split(':');
    boldText = firstPart || boldText;
    const tail = rest.join(':');
    regularText = tail ? `: ${tail}` : '';
  }

  const nameSource = data.customer_name || data.user_name || data.tournament_name || '';
  const fallback = nameSource
    ? nameSource
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'NT';

  return {
    id: notification.id,
    avatar: null,
    fallback,
    boldText,
    regularText,
    timestamp: notification.created_at ? new Date(notification.created_at).toLocaleString() : '',
    // actionLabel is reserved for future use
    actionLabel: null,
    unread: !notification.read_at,
  };
}

function NotificationCard({ notification, onActionClick }) {
  const { avatar, fallback, boldText, regularText, timestamp, actionLabel, unread } = notification;

  return (
    <article className="flex items-start gap-3 rounded-[17px] bg-[#141412] p-4">
      <Avatar className="h-12 w-12 shrink-0 rounded-full bg-[#252520]">
        {avatar && <AvatarImage src={avatar} alt="" />}
        <AvatarFallback className="bg-[#252520] text-sm font-semibold text-[#141412]">{fallback}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-snug text-white">
          <span className="font-bold">{boldText}</span>
          <span className="font-normal">{regularText}</span>
        </p>
        <p className="mt-1 text-[12px] text-[#A2A6AB]">{timestamp}</p>
      </div>
      {(actionLabel || unread) && (
        <div className="flex shrink-0 items-center gap-2">
          {actionLabel && onActionClick && (
            <button
              type="button"
              onClick={() => onActionClick(notification)}
              className="rounded-[6px] border border-[#DA9811] bg-transparent px-3 py-1 text-[13px] font-bold text-[#DA9811] transition-opacity active:opacity-90"
            >
              {actionLabel}
            </button>
          )}
          {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#4CAF50]" aria-hidden />}
        </div>
      )}
    </article>
  );
}

export default function NotificationCenter() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [markAllError, setMarkAllError] = useState(false);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetNotificationsQuery({
    page,
    per_page: PAGE_SIZE,
  });

  const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

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
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        }),
    [items],
  );

  const hasMoreOlder = (apiResponse?.meta?.current_page ?? 0) < (apiResponse?.meta?.last_page ?? 0);

  const loadOlder = () => {
    if (!hasMoreOlder || isFetching) return;
    setPage((prev) => prev + 1);
  };

  const handleMarkAllAsRead = async () => {
    setMarkAllError(false);
    try {
      await markAllNotificationsRead().unwrap();
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || now })));
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      setMarkAllError(true);
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="NOTIFICATION CENTER" />

      <Container>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">LATEST</h2>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-[12px] font-normal text-[#DA9811] underline transition-opacity active:opacity-90"
            >
              {isMarkingAll ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {isLoading && <p className="mb-3 text-[12px] text-[#A2A6AB]">Loading notifications…</p>}

        {(isError || markAllError) && (
          <p className="mb-3 text-[12px] text-[#DA9811]">
            {isError
              ? 'Failed to load notifications. Please try again.'
              : 'Failed to mark notifications as read. Please try again.'}
          </p>
        )}

        {notifications.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-label="Notifications">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationCard notification={notification} />
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && <p className="text-[12px] text-[#A2A6AB]">You have no notifications yet.</p>
        )}

        {hasMoreOlder && (
          <div className="mt-6 flex flex-col items-center pb-4">
            <button
              type="button"
              onClick={loadOlder}
              disabled={isFetching}
              className="text-[12px] font-normal text-[#A2A6AB] transition-opacity active:opacity-90 disabled:opacity-60"
            >
              {isFetching ? 'Loading…' : 'View Older'}
            </button>
            <ChevronDown />
          </div>
        )}
      </Container>
    </div>
  );
}
