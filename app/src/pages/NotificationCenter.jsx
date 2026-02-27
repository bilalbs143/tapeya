import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';

const PAGE_SIZE = 3;

// Single source of truth (newest first). Replace with API/real-time data later.
const NOTIFICATIONS_MOCK = [
  { id: '1', avatar: null, fallback: 'AB', boldText: 'Arsalan Butt', regularText: ' Started following you...', timestamp: '5 minutes ago', actionLabel: 'Follow Back', unread: true },
  { id: '2', avatar: null, fallback: 'RK', boldText: '7th Match Rawalpindi Royal vs Karachi Kids - Season 2', regularText: ' Starting in 30 min.', timestamp: '10 minutes ago', actionLabel: null, unread: true },
  { id: '3', avatar: null, fallback: 'T', boldText: 'New updates in the app!', regularText: ' Download latest version now.', timestamp: '3 hours ago', actionLabel: null, unread: true },
  { id: '4', avatar: null, fallback: 'AB', boldText: 'Arsalan Butt', regularText: ' Started following you...', timestamp: '1 day ago', actionLabel: 'Follow Back', unread: false },
  { id: '5', avatar: null, fallback: 'RK', boldText: '8th Match Lahore vs Islamabad - Season 2', regularText: ' Starting tomorrow.', timestamp: '1 day ago', actionLabel: null, unread: false },
  { id: '6', avatar: null, fallback: 'T', boldText: 'App maintenance scheduled.', regularText: ' Feb 25, 2:00 AM – 4:00 AM.', timestamp: '2 days ago', actionLabel: null, unread: false },
  { id: '7', avatar: null, fallback: 'MK', boldText: 'Match result: Karachi Kids won by 5 wickets.', regularText: ' View scorecard.', timestamp: '3 days ago', actionLabel: null, unread: false },
  { id: '8', avatar: null, fallback: 'T', boldText: 'Welcome to Tapeya!', regularText: ' Complete your profile to get started.', timestamp: '1 week ago', actionLabel: null, unread: false },
];

const ChevronLeft = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);
const backButtonClass =
  'flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80';

const ChevronDown = () => (
  <svg className="h-4 w-4 text-[#A2A6AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function NotificationCard({ notification }) {
  const { avatar, fallback, boldText, regularText, timestamp, actionLabel, unread } = notification;
  return (
    <article className="flex items-start gap-3 rounded-[17px] bg-[#141412] p-4">
      <Avatar className="h-12 w-12 shrink-0 rounded-full bg-[#252520]">
        {avatar && <AvatarImage src={avatar} alt="" />}
        <AvatarFallback className="bg-[#252520] text-sm font-semibold text-white">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-snug text-white">
          <span className="font-bold">{boldText}</span>
          <span className="font-normal">{regularText}</span>
        </p>
        <p className="mt-1 text-[12px] text-[#A2A6AB]">{timestamp}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actionLabel && (
          <button
            type="button"
            className="rounded-[6px] bg-transparent border border-[#DA9811] px-3 py-1 text-[13px] font-bold text-[#DA9811] transition-opacity active:opacity-90"
          >
            {actionLabel}
          </button>
        )}
        {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#4CAF50]" aria-hidden />}
      </div>
    </article>
  );
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const notifications = NOTIFICATIONS_MOCK; // Replace with API/real-time list when integrating
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const displayed = notifications.slice(0, visibleCount);
  const hasMoreOlder = visibleCount < notifications.length;

  const loadOlder = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, notifications.length));
  }, [notifications.length]);

  return (
    <div className="bg-black">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-black px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={backButtonClass}
          aria-label="Back"
        >
          <ChevronLeft />
        </button>
        <h1 className="min-w-0 flex-1 pr-9 text-center text-[16px] font-bold uppercase tracking-wide text-white">
          NOTIFICATION CENTER
        </h1>
      </header>

      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">LATEST</h2>
          <button
            type="button"
            className="text-[12px] font-normal text-[#DA9811] underline transition-opacity active:opacity-90"
          >
            Mark all as read
          </button>
        </div>

        <ul className="flex flex-col gap-3" aria-label="Notifications">
          {displayed.map((notification) => (
            <li key={notification.id}>
              <NotificationCard notification={notification} />
            </li>
          ))}
        </ul>

        {hasMoreOlder && (
          <div className="mt-6 flex flex-col items-center pb-4">
            <button
              type="button"
              onClick={loadOlder}
              className="text-[12px] font-nornal text-[#A2A6AB] transition-opacity active:opacity-90"
            >
              View Older
            </button>
            <ChevronDown />
          </div>
        )}
      </div>
    </div>
  );
}
