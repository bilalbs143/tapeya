import { useNavigate, useLocation } from 'react-router-dom';

import teamIcon from '@/assets/images/icons/team-icon.svg';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

function TeamLogoIcon() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
      <img src={teamIcon} alt="" className="h-full w-full object-contain" />
    </div>
  );
}

function TeamCard({ team, index }) {
  return (
    <div className="flex items-start gap-3 rounded-[17px] bg-[#141412] p-4">
      <TeamLogoIcon />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-bold text-white">{team.name}</h3>
        <p className="mt-0.5 text-[14px] text-white">
          Owner: <span className="font-medium text-[#DA9811]">{team.owner}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-white">
          Icon Player: <span className="text-[#A2A6AB]">{team.iconPlayer}</span>
        </p>
      </div>
      <span className="shrink-0 text-[28px] font-bold text-[#DA98113B]">
        {index + 1}
      </span>
    </div>
  );
}

const MOCK_TEAMS = [
  {
    id: '1',
    name: 'Al Fareed - Mian Channu',
    owner: 'Mian Asif Naddem',
    iconPlayer: 'Asif Butt',
  },
  {
    id: '2',
    name: 'Al Fareed - Mian Channu',
    owner: 'Mian Asif Naddem',
    iconPlayer: 'Asif Butt',
  },
  {
    id: '3',
    name: 'Al Fareed - Mian Channu',
    owner: 'Mian Asif Naddem',
    iconPlayer: 'Asif Butt',
  },
  {
    id: '4',
    name: 'Al Fareed - Mian Channu',
    owner: 'Mian Asif Naddem',
    iconPlayer: 'Asif Butt',
  },
];

export default function SavedItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const newTeam = location.state?.newTeam;
  const teams = newTeam ? [newTeam, ...MOCK_TEAMS] : MOCK_TEAMS;

  const handleSubmitTeams = () => {
    navigate('/organizer-tournament/add-squad', { state: { teams } });
  };

  return (
    <div className="min-h-screen bg-black">
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
            Organizer - Create Team
          </h1>
        </header>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
          </h2>
          <button
            type="button"
            onClick={() => navigate('/organizer-tournament/add-team')}
            className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
          >
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#DA9811] text-[18px] font-bold text-[#080807]">
              +
            </span>
            <span className="text-[13px] font-bold text-[#A2A6AB]">
              Create Team
            </span>
          </button>
        </div>

        <ul className="space-y-3 pb-40">
          {teams.map((team, index) => (
            <li key={team.id ?? index}>
              <TeamCard team={team} index={index} />
            </li>
          ))}
        </ul>

        <div className="fixed bottom-20 left-0 right-0 z-50 border-t border-[#FFFFFF12] bg-black px-4 pb-4 pt-4">
          <Button
            type="button"
            variant="auth"
            className="h-12 w-full rounded-[8px] bg-[#E4E7F4] text-[15px] font-semibold uppercase tracking-wide text-[#1a1a1a]"
            onClick={handleSubmitTeams}
          >
            Submit Teams
          </Button>
        </div>
      </Container>
    </div>
  );
}
