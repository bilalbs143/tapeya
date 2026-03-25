import { useMemo, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import searchIcon from '@/assets/images/icons/searchicon.svg';
import teamIcon from '@/assets/images/icons/team-icon.svg';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { useAppDispatch } from '@/store/hooks';
import { openDialog } from '@/store/slices/commonSlice';
import { Container } from '@/ui/Container';

const MOCK_PLAYERS = [
  { id: '1', name: 'Arslan Butt', role: 'Batsman' },
  { id: '2', name: 'Rahmanullah Gurbaz', role: 'Bowler' },
  { id: '3', name: 'Ishan Kishan', role: 'All rounder' },
  { id: '4', name: 'Sahibzada Farhan', role: 'Batsman' },
  { id: '5', name: 'Sohaib Khan', role: 'Batsman' },
];

const DEFAULT_TEAM = {
  id: '1',
  name: 'Al Fareed - Mian Channu',
  owner: 'Mian Asif Naddem',
  iconPlayer: 'Asif Butt',
};

export default function TeamDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const team = location.state?.team ?? DEFAULT_TEAM;

  const [findPlayer, setFindPlayer] = useState('');
  const [nickName, setNickName] = useState('');

  const filteredPlayers = useMemo(() => {
    if (!findPlayer.trim()) return MOCK_PLAYERS;
    const q = findPlayer.trim().toLowerCase();
    return MOCK_PLAYERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q),
    );
  }, [findPlayer]);

  const handleSubmitSquad = () => {
    // TODO: Integrate API when backend is ready
    dispatch(
      openDialog({
        key: 'draftingSubmitSquadSuccess',
        props: { teamName: team.name },
      }),
    );
  };

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 lg:mt-0 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
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

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div>
            <p className="mb-3 text-[13px] font-medium tracking-wide text-[#A2A6AB] uppercase">
              {team.name.toUpperCase()}
            </p>

            <div className="mb-5 flex items-stretch gap-3 rounded-[17px] bg-[#141412] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={teamIcon}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-white">{team.name}</h2>
                <p className="mt-0.5 text-[14px] text-[#DA9811]">
                  Owner: {team.owner}
                </p>
                <p className="mt-0.5 text-[12px] text-white">
                  Icon Players: {team.iconPlayer}
                </p>
              </div>
              <span className="text-[28px] font-bold text-[#DA98113B]">1</span>
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="search"
                  value={findPlayer}
                  onChange={(e) => setFindPlayer(e.target.value)}
                  placeholder="Find player"
                  className="h-12 w-full rounded-[6px] bg-[#141412] py-3 pr-12 pl-4 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none"
                  aria-label="Find player"
                />
                <img
                  src={searchIcon}
                  alt=""
                  className="absolute top-1/2 right-4 h-[19px] w-[19px] -translate-y-1/2 opacity-70"
                />
              </div>
            </div>

            <div className="mb-5">
              <input
                type="text"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                placeholder="Nick name"
                className="h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none"
                aria-label="Nick name"
              />
            </div>
          </div>

          <div className="mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full border-collapse text-[12px] text-white">
              <thead>
                <tr className={HEADER_BG}>
                  <th
                    className={`${HEADER_BG} border-r border-b border-l py-2.5 pl-4 text-left font-bold text-white ${BORDER}`}
                  >
                    Player
                  </th>
                  <th
                    className={`${HEADER_BG} border-r border-b py-2.5 pr-4 text-right font-bold text-white ${BORDER}`}
                  >
                    Playing Role
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr key={player.id}>
                    <td
                      className={`border-r border-b border-l py-3 pl-4 ${BORDER}`}
                    >
                      <p className="text-[12px] font-medium text-white">
                        {index + 1} {player.name}
                      </p>
                    </td>
                    <td
                      className={`border-r border-b py-3 pr-4 text-right text-white ${BORDER}`}
                    >
                      {player.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitSquad}
          className="m-auto flex h-12 max-w-fit items-center justify-center rounded-[6px] border border-[#DA9811] px-4 text-center text-[16px] font-bold tracking-wide text-[#DA9811] uppercase transition-opacity active:opacity-90 lg:m-0"
        >
          Submit Squad
        </button>
      </Container>
    </div>
  );
}
