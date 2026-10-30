import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CartIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { isOrderNotification } from '../lib/notificationsPage';
import type { AppNotification } from '../model/schemas';
import type { useNotifications } from './useNotifications';

type NotificationsFlow = ReturnType<typeof useNotifications>;

type NotificationsBodyProps = {
  flow: NotificationsFlow;
};

function NotificationAvatar({ n }: { n: AppNotification }) {
  if (isOrderNotification(n)) {
    return (
      <span className="border-border-subtle bg-surface-raised text-brand-text grid h-9 w-9 shrink-0 place-items-center rounded-full border">
        <CartIcon size="sm" className="h-4 w-4" strokeWidth={1.9} />
      </span>
    );
  }

  return <Avatar src={n.avatarUrl ?? undefined} name={n.actorName ?? n.initials} size="md" className="shrink-0" />;
}

function NotificationRow({ notification: n, onOpen }: { notification: AppNotification; onOpen: () => void }) {
  const interactive = Boolean(n.href) || n.unread;
  const body = (
    <>
      <NotificationAvatar n={n} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {n.kind ? (
          <span className="text-dim font-mono text-4xs font-bold tracking-wide uppercase">{n.kind}</span>
        ) : null}
        <p className="text-xs leading-normal text-ink">
          {n.actorName ? <b className="font-bold">{n.actorName} </b> : null}
          {n.message}
        </p>
        <span className="font-mono text-dim text-4xs font-medium">{n.age}</span>
      </span>
    </>
  );

  // Horizontal rules come from the parent `divide-y` list — unread only adds a left accent.
  const className = cn('flex gap-2.5 px-4 py-3', n.unread && 'border-brand bg-brand/6 border-l-2');

  if (n.href && interactive) {
    return (
      <Link
        to={n.href}
        onClick={(e) => {
          e.preventDefault();
          onOpen();
        }}
        className={className}
        aria-label={`${n.message}${n.unread ? ', unread' : ''}`}
      >
        {body}
      </Link>
    );
  }

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(className, 'w-full text-left')}
        aria-label={`${n.message}${n.unread ? ', unread' : ''}`}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

/** Day groups, empty/error, and load-older for NotificationsPage. */
export function NotificationsBody({ flow }: NotificationsBodyProps) {
  const { listQuery, olderState, items, hasOlder, groups, loadOlder, handleOpen } = flow;

  return (
    <div className="flex flex-1 flex-col pb-6">
      {listQuery.isLoading && items.length === 0 ? (
        <div className="flex flex-col gap-3 px-4 pt-4" aria-busy="true" aria-label="Loading Notifications">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex gap-3 py-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : listQuery.isError && items.length === 0 ? (
        <div className="px-4 py-8">
          <ErrorState title="Could Not Load Notifications" onRetry={() => void listQuery.refetch()} />
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8">
          <EmptyState
            className="min-h-[360px] justify-center"
            title="No Notifications Yet"
            description="Likes, comments, follows, and order updates will show up here."
          />
        </div>
      ) : (
        <>
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="font-mono text-muted px-4 pt-3 pb-1.5 text-4xs font-bold tracking-eyebrow uppercase">
                {group.label}
              </h2>
              <ul className="border-border-subtle divide-border-subtle divide-y border-y">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <NotificationRow notification={n} onOpen={() => void handleOpen(n)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {hasOlder ? (
            <div className="px-4 pt-4">
              <Button
                variant="secondary"
                className="h-11 w-full font-bold"
                disabled={olderState.isFetching}
                onClick={() => void loadOlder()}
              >
                {olderState.isFetching ? 'Loading…' : 'View Older'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
