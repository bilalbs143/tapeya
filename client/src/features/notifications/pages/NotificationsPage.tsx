import { ScreenBar } from '@/shared/layout';

import { NotificationsBody } from '../ui/NotificationsBody';
import { useNotifications } from '../ui/useNotifications';

/** Notifications — paginate, mark read, deep links. */
export default function NotificationsPage() {
  const flow = useNotifications();
  const { subtitle, unreadCount, markAllState, handleMarkAll, goBack } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar
        title="Notifications"
        subtitle={subtitle}
        onBack={goBack}
        action={
          <button
            type="button"
            onClick={() => void handleMarkAll()}
            disabled={markAllState.isLoading || unreadCount === 0}
            className="text-brand-text shrink-0 px-1 text-2xs font-bold disabled:opacity-40"
          >
            {markAllState.isLoading ? 'Marking…' : 'Mark All'}
          </button>
        }
      />
      <NotificationsBody flow={flow} />
    </div>
  );
}
