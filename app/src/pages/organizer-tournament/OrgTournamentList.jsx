import { useNavigate } from 'react-router-dom';

import { Container } from '@/ui/Container';

// Placeholder cricket image - replace with your asset path if needed
const TOURNAMENT_IMAGE =
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&h=200&fit=crop';

const SCHEDULED_TOURNAMENTS = [
  {
    id: '1',
    name: 'Tape Ball Cricket Championship',
    season: 'Season 1 - 2026',
    dates: '28 Feb - 7th March 2026',
    venue: 'Multan',
    teams: 8,
    prizeMoney: '1 Crore',
  },
];

const PREVIOUS_TOURNAMENTS = [
  {
    id: '2',
    name: 'Tape Ball Cricket Championship',
    season: 'Season 1 - 2026',
    dates: '28 Feb - 7th March 2026',
    venue: 'Multan',
    teams: 8,
    prizeMoney: '1 Crore',
    winningTeam: 'Karachi Kids',
  },
  {
    id: '3',
    name: 'Tape Ball Cricket Championship',
    season: 'Season 1 - 2026',
    dates: '28 Feb - 7th March 2026',
    venue: 'Multan',
    teams: 8,
    prizeMoney: '1 Crore',
    winningTeam: 'Karachi Kids',
  },
];

function TournamentCard({ tournament, showWinningTeam = false }) {
  return (
    <div className="flex gap-3 rounded-[17px] bg-[#141412] p-3">
      <div className="flex w-[100px] shrink-0 self-stretch overflow-hidden rounded-xl">
        <img
          src={TOURNAMENT_IMAGE}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold text-white">
          {tournament.name}
        </h3>
        <p className="mt-0.5 text-[13px] font-bold text-white">
          {tournament.season}
        </p>
        <ul className="mt-1.5 space-y-0.5 text-xs">
          <li>
            <span className="text-[#A2A6AB]">Dates:</span>{' '}
            <span className="text-white">{tournament.dates}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Venue:</span>{' '}
            <span className="text-white">{tournament.venue}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Teams:</span>{' '}
            <span className="text-white">{tournament.teams}</span>
          </li>
          <li>
            <span className="text-[#A2A6AB]">Prize Money:</span>{' '}
            <span className="text-white">{tournament.prizeMoney}</span>
          </li>
          {showWinningTeam && tournament.winningTeam && (
            <li>
              <span className="text-[#DA9811]">Winning Team:</span>{' '}
              <span className="text-[#DA9811]">{tournament.winningTeam}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function OrgTournamentList() {
  const navigate = useNavigate();

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Organizer Tournaments
          </h1>
        </header>

        <div className="space-y-6 pb-6">
          <section>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
              Scheduled Tournaments
            </h2>
            <div className="space-y-3">
              {SCHEDULED_TOURNAMENTS.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
              Previous Tournaments
            </h2>
            <div className="space-y-3">
              {PREVIOUS_TOURNAMENTS.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  showWinningTeam
                />
              ))}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
