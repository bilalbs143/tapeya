import { useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDateRange } from '@/lib/utils/dateUtils';
import { parseDate, toDateStr } from '@/lib/utils/dateUtils';
import { getTournamentDisplayImage, getTournamentTitle } from '@/lib/utils/tournamentUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { scorecardListClass, scorecardTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

const MONTH_TABS_COUNT = 6;
const FALLBACK_IMAGE = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

const upcomingTriggerClass =
  'min-w-[72px] flex-col items-center justify-center gap-0 rounded-xl px-4 py-2.5 text-white data-[state=active]:text-black lg:min-w-[96px]';

function UpcomingTournamentCard({ tournament, onClick, disabled }) {
  const imageUrl = getTournamentDisplayImage(tournament, FALLBACK_IMAGE);
  const title = getTournamentTitle(tournament);

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick(tournament)}
      disabled={disabled}
      className="flex w-full flex-col overflow-hidden rounded-[17px] bg-surface text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90 disabled:cursor-default disabled:opacity-60"
    >
      <div className="h-[148px] w-full overflow-hidden bg-surface-deep">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Guard prevents an infinite error loop if FALLBACK_IMAGE also fails.
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{title}</h3>
        <p className="text-[12px] text-muted">{formatDateRange(tournament.start_date, tournament.end_date)}</p>
      </div>
    </button>
  );
}

export default function UpcomingTournaments() {
  const navigate = useNavigate();

  const nowRef = useRef(new Date());
  const now = nowRef.current;

  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [activeMonth, setActiveMonth] = useState(currentMonth);

  const { data, isLoading, isError } = useGetTournamentsQuery({ all: true });
  const todayStr = toDateStr(now);

  const monthTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < MONTH_TABS_COUNT; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      tabs.push({
        value: toDateStr(d).slice(0, 7),
        monthShort: d.toLocaleDateString('en-GB', { month: 'short' }),
        year: d.getFullYear(),
      });
    }
    return tabs;
  }, [now]);

  const upcomingByMonth = useMemo(() => {
    const list = data?.data ?? [];
    const byMonth = {};
    monthTabs.forEach(({ value }) => {
      byMonth[value] = [];
    });

    list.forEach((t) => {
      const start = parseDate(t.start_date);
      const end = parseDate(t.end_date);
      const startStr = start ? toDateStr(start) : '';
      const endStr = end ? toDateStr(end) : '';
      // Skip tournaments that ended before today.
      if (endStr && endStr < todayStr && startStr < todayStr) return;

      monthTabs.forEach(({ value }) => {
        const [y, m] = value.split('-').map(Number);
        const monthStart = new Date(y, m - 1, 1);
        const monthEnd = new Date(y, m, 0);
        const inMonth =
          (start && start <= monthEnd && (!end || end >= monthStart)) ||
          (end && end >= monthStart && (!start || start <= monthEnd));
        if (inMonth) byMonth[value].push(t);
      });
    });

    return byMonth;
  }, [data?.data, monthTabs, todayStr]);

  const cardsToShow = upcomingByMonth[activeMonth] ?? [];
  const isEmpty = cardsToShow.length === 0;

  const handleCardClick = (tournament) => {
    if (tournament.id == null) return;
    navigate(`/upcoming-tournaments/${tournament.id}`, {
      state: {
        tournament: {
          ...tournament,
          name: tournament.tournament_name ?? tournament.name,
        },
      },
    });
  };

  return (
    <div>
      <AppSubpageHeader title="UPCOMING TOURNAMENTS" />
      <Container>
        <Tabs value={activeMonth} onValueChange={setActiveMonth} className="w-full">
          <div className="-mx-4 bg-black px-4 pb-3">
            <TabsList className={`${scorecardListClass} lg:justify-center lg:gap-2`}>
              {monthTabs.map(({ value, monthShort, year }) => (
                <TabsTrigger key={value} value={value} className={`${scorecardTriggerClass} ${upcomingTriggerClass}`}>
                  <span className="block text-[12px] leading-tight font-bold uppercase">{monthShort}</span>
                  <span className="mt-1 block text-[12px] leading-tight font-medium uppercase opacity-90">{year}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 pb-6 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={`skeleton-${i}`} className="flex animate-pulse flex-col overflow-hidden rounded-[17px] bg-surface">
                    <div className="h-[148px] w-full bg-surface-border" />
                    <div className="flex flex-col gap-2 p-3">
                      <div className="h-4 w-3/4 rounded bg-surface-border" />
                      <div className="h-3 w-1/2 rounded bg-surface-border" />
                    </div>
                  </div>
                ))
              : cardsToShow.map((tournament) => (
                  <UpcomingTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onClick={handleCardClick}
                    disabled={tournament.id == null}
                  />
                ))}
          </div>

          {isLoading && <p className="py-4 text-center text-[13px] text-muted">Loading tournaments…</p>}
          {isError && <p className="py-4 text-center text-[13px] text-red-400">Failed to load tournaments. Try again later.</p>}
          {isEmpty && !isLoading && !isError && (
            <p className="py-2 text-center text-[13px] text-muted">No upcoming tournaments for this month.</p>
          )}
        </Tabs>
      </Container>
    </div>
  );
}
