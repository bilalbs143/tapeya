import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../api/notificationsApi';
import {
  groupNotificationsByDay,
  mergeNotifications,
  NOTIFICATIONS_PAGE_SIZE,
  notificationsSubtitle,
} from '../lib/notificationsPage';
import type { AppNotification } from '../model/schemas';

/** Paginate, mark read, and open deep links for NotificationsPage. */
export function useNotifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [older, setOlder] = useState<AppNotification[]>([]);
  const [optimisticRead, setOptimisticRead] = useState<Set<string>>(() => new Set());

  const listQuery = useGetNotificationsQuery({ page: 1, perPage: NOTIFICATIONS_PAGE_SIZE });
  const [fetchPage, olderState] = useLazyGetNotificationsQuery();
  const [markAll, markAllState] = useMarkAllNotificationsReadMutation();
  const [markOne] = useMarkNotificationReadMutation();

  const items = useMemo(
    () => mergeNotifications(listQuery.data?.items ?? [], older, optimisticRead),
    [listQuery.data?.items, older, optimisticRead]
  );

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items]);
  const lastPage = listQuery.data?.meta.lastPage ?? olderState.data?.meta.lastPage ?? 1;
  const hasOlder = page < lastPage;

  const groups = useMemo(() => groupNotificationsByDay(items), [items]);

  const subtitle = notificationsSubtitle({
    loading: listQuery.isLoading,
    itemCount: items.length,
    unreadCount,
  });

  async function loadOlder() {
    if (!hasOlder || olderState.isFetching) return;
    const next = page + 1;
    try {
      const result = await fetchPage({ page: next, perPage: NOTIFICATIONS_PAGE_SIZE }).unwrap();
      setOlder((prev) => {
        const ids = new Set(prev.map((n) => n.id));
        return [...prev, ...result.items.filter((n) => !ids.has(n.id))];
      });
      setPage(next);
    } catch (err) {
      toast({
        title: "Couldn't Load Older Notifications",
        description: getApiErrorMessage(err, 'Try again.'),
        tone: 'error',
      });
    }
  }

  async function handleMarkAll() {
    if (unreadCount === 0 || markAllState.isLoading) return;
    const previous = new Set(optimisticRead);
    setOptimisticRead(new Set(items.map((n) => n.id)));
    try {
      await markAll().unwrap();
      setOlder((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (err) {
      setOptimisticRead(previous);
      toast({
        title: "Couldn't Mark All as Read",
        description: getApiErrorMessage(err, 'Try again.'),
        tone: 'error',
      });
    }
  }

  async function handleOpen(n: AppNotification) {
    if (n.unread) {
      setOptimisticRead((prev) => new Set(prev).add(n.id));
      try {
        await markOne(n.id).unwrap();
      } catch {
        // Keep optimistic read; list invalidation reconciles.
      }
    }
    if (n.href && n.href !== '/notifications') {
      navigate(n.href);
    }
  }

  function goBack() {
    navigate(-1);
  }

  return {
    listQuery,
    olderState,
    markAllState,
    items,
    unreadCount,
    hasOlder,
    groups,
    subtitle,
    loadOlder,
    handleMarkAll,
    handleOpen,
    goBack,
  };
}
