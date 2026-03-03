import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatDateRange } from '@/lib/format';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import {
  MONTH_TABS_COUNT,
  PLACEHOLDER_CARD_IMAGE,
  PLACEHOLDER_TITLES,
} from './constants';

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T12:00:00');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function UpcomingTournamentCard({ tournament, onClick }) {
  const imageUrl =
    tournament.display_image || tournament.cover_image || PLACEHOLDER_CARD_IMAGE;
  const title = tournament.tournament_name || tournament.name || 'Tournament';

  return (
    <button
      type="button"
      onClick={() => onClick(tournament)}
      className="flex w-full flex-col overflow-hidden rounded-[17px] bg-[#141412] text-left transition-opacity active:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div className="h-[148px] w-full overflow-hidden bg-[#0d0d0b]">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold text-white">{title}</h3>
        <p className="text-[12px] text-[#A2A6AB]">
          {formatDateRange(tournament.start_date, tournament.end_date)}
        </p>
      </div>
    </button>
  );
}

export default function UpcomingTournaments() {
  const navigate = useNavigate();
  const now = new Date();
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
  }, []);

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
      if (endStr < todayStr && startStr < todayStr) return;

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

  const cardsToShow = useMemo(() => {
    const real = upcomingByMonth[activeMonth] ?? [];
    if (real.length > 0) return real;

    const [y, m] = activeMonth.split('-').map(Number);
    return PLACEHOLDER_TITLES.map((title, i) => {
      const start = new Date(y, m - 1, 10 + i);
      const end = new Date(start);
      end.setDate(end.getDate() + 5);
      return {
        id: `placeholder-${activeMonth}-${i}`,
        tournament_name: title,
        name: title,
        start_date: toDateStr(start),
        end_date: toDateStr(end),
        isPlaceholder: true,
      };
    });
  }, [upcomingByMonth, activeMonth]);

  const handleCardClick = (tournament) => {
    const id = tournament.id ?? 'preview';
    navigate(`/upcoming-tournaments/${id}`, {
      state: {
        tournament: {
          ...tournament,
          name: tournament.tournament_name ?? tournament.name,
        },
      },
    });
  };

  const hasRealData = (upcomingByMonth[activeMonth] ?? []).length > 0;

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center justify-center bg-black px-4 pt-6 pb-4">
          <h1 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
            UPCOMING TOURNAMENTS
          </h1>
        </header>

        <Tabs value={activeMonth} onValueChange={setActiveMonth} className="w-full">
          <div className="-mx-4 bg-black px-4 pb-3">
            <TabsList className={scorecardListClass}>
              {monthTabs.map(({ value, monthShort, year }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`${scorecardTriggerClass} min-w-[72px] flex-col items-center justify-center gap-0 rounded-xl px-4 py-2.5 data-[state=inactive]:text-white data-[state=active]:text-black`}
                >
                  <span className="block text-[12px] font-bold uppercase leading-tight">
                    {monthShort}
                  </span>
                  <span className="mt-1 block text-[12px] font-medium uppercase leading-tight opacity-90">
                    {year}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-6 pt-1">
            {cardsToShow.map((tournament) => (
              <UpcomingTournamentCard
                key={tournament.id}
                tournament={tournament}
                onClick={handleCardClick}
              />
            ))}
          </div>

          {isLoading && (
            <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
              Loading tournaments…
            </p>
          )}
          {isError && (
            <p className="py-4 text-center text-[13px] text-red-400">
              Failed to load tournaments. Try again later.
            </p>
          )}
          {!hasRealData && !isLoading && (
            <p className="py-2 text-center text-[13px] text-[#A2A6AB]">
              No upcoming tournaments for this month. Showing sample cards.
            </p>
          )}
        </Tabs>
      </Container>
    </div>
  );
}
