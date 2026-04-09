import { useLocation, useNavigate } from 'react-router-dom';

import teamDeleteIcon from '@/assets/images/icons/team-delete-icon.svg';
import teamEditIcon from '@/assets/images/icons/team-edit-icon.svg';
import teamIcon from '@/assets/images/icons/team-icon.svg';
import { Container } from '@/ui/Container';

function TeamLogoIcon() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
      <img src={teamIcon} alt="" className="h-full w-full object-contain" />
    </div>
  );
}

function TeamCard({ team, index, onEdit, onDelete, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(team)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.(team)}
      className="flex cursor-pointer items-start gap-3 rounded-[17px] bg-[#141412] p-4 transition-opacity active:opacity-90"
    >
      <TeamLogoIcon />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-bold text-white">{team.name}</h3>
        <p className="mt-0.5 text-[14px] text-[#A2A6AB]">
          <span className="font-medium text-[#DA9811]">
            Owner: {team.owner}
          </span>
        </p>
        <p className="mt-0.5 text-[12px] text-[#A2A6AB]">
          Icon Players: <span className="text-white">{team.iconPlayer}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(team);
            }}
            className="flex h-4 w-4 items-center justify-end rounded-lg transition-opacity active:opacity-80"
            aria-label="Edit team"
          >
            <img src={teamEditIcon} alt="" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(team);
            }}
            className="flex h-4 w-4 items-center justify-end rounded-lg transition-opacity active:opacity-80"
            aria-label="Delete team"
          >
            <img src={teamDeleteIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
        <span className="text-[28px] font-bold text-[#DA98113B]">
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

export default function TeamList() {
  const navigate = useNavigate();
  const location = useLocation();
  const newTeam = location.state?.newTeam;
  const teams = newTeam ? [newTeam, ...MOCK_TEAMS] : MOCK_TEAMS;

  const handleTeamClick = (team) => {
    navigate(`/drafting/teams/${team.id}`, { state: { team } });
  };

  const handleEdit = (_team) => {
    // TODO: Navigate to edit team or open edit modal
  };

  const handleDelete = (_team) => {
    // TODO: Confirm and delete team
  };

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6 lg:mt-0">
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
          <h1 className="min-w-0 flex-1 text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Drafting
          </h1>
        </header>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
          </h2>
          <button
            type="button"
            onClick={() => navigate('/drafting/add-team')}
            className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
          >
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#DA9811] text-[18px] font-bold text-[#080807]">
              +
            </span>
            <span className="text-[14px] font-semibold text-white">
              Create Teams
            </span>
          </button>
        </div>

        <ul className="space-y-3 pb-10 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
          {teams.map((team, index) => (
            <li key={team.id ?? index}>
              <TeamCard
                team={team}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={handleTeamClick}
              />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
