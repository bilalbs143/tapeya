import { useNavigate, useLocation } from 'react-router-dom';

import teamDeleteIcon from '@/assets/images/icons/team-delete-icon.svg';
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

function TeamCard({ team, index, onAddSquad, onDelete }) {
  return (
    <div className="rounded-[17px] bg-[#141412] p-4">
      <div className="flex justify-end gap-1.5">
        <Button
          type="button"
          variant="file"
          size="sm"
          className="h-8 rounded-full border border-[#DA9811] bg-transparent px-3 text-[12px] font-semibold text-[#DA9811]"
          onClick={() => onAddSquad?.(team)}
        >
          Add Squad
        </Button>
        <button
          type="button"
          onClick={() => onDelete?.(team)}
          className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80"
          aria-label="Delete team"
        >
          <img src={teamDeleteIcon} alt="" className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <TeamLogoIcon />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-white">{team.name}</h3>
          <p className="mt-1 text-[14px] text-[#DA9811]">
            Owner: {team.owner}
          </p>
          <p className="mt-0.5 text-[12px] text-white">
            Icon Player: {team.iconPlayer}
          </p>
        </div>
        <span className="shrink-0 self-center text-[28px] font-bold leading-none text-[#DA98113B]">
          {index + 1}
        </span>
      </div>
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
  {
    id: '5',
    name: 'Al Fareed - Mian Channu',
    owner: 'Mian Asif Naddem',
    iconPlayer: 'Asif Butt',
  },
];

export default function AddSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateTeams = location.state?.teams;
  const newTeam = location.state?.newTeam;
  const teams = stateTeams?.length
    ? stateTeams
    : newTeam
      ? [newTeam, ...MOCK_TEAMS]
      : MOCK_TEAMS;

  const handleAddSquad = (team) => {
    navigate('/organizer-tournament/edit-squad', { state: { team } });
  };

  const handleDelete = (team) => {
    // TODO: Confirm and delete team
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
            Organizer - Team List
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

        <ul className="space-y-3 pb-10">
          {teams.map((team, index) => (
            <li key={team.id ?? index}>
              <TeamCard
                team={team}
                index={index}
                onAddSquad={handleAddSquad}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
