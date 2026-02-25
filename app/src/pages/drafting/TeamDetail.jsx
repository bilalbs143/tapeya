import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';

import teamIcon from '@/assets/images/icons/team-icon.svg';
import searchIcon from '@/assets/images/icons/searchicon.svg';
import { Container } from '@/ui/Container';
import {
  Dialog,
  DialogClose,
  DialogContentProfile,
  DialogScrollBody,
} from '@/ui/Dialog';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';

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
  const { teamId } = useParams();
  const location = useLocation();
  const team = location.state?.team ?? DEFAULT_TEAM;

  const [findPlayer, setFindPlayer] = useState('');
  const [nickName, setNickName] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filteredPlayers = useMemo(() => {
    if (!findPlayer.trim()) return MOCK_PLAYERS;
    const q = findPlayer.trim().toLowerCase();
    return MOCK_PLAYERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q),
    );
  }, [findPlayer]);

  const handleSubmitSquad = () => {
    // TODO: Integrate API when backend is ready
    setShowSuccessModal(true);
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
          <h1 className="min-w-0 flex-1 text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Drafting
          </h1>
        </header>

        <p className="mb-3 text-[13px] font-medium uppercase tracking-wide text-[#A2A6AB]">
          {team.name.toUpperCase()}
        </p>

        <div className="mb-5 flex items-stretch gap-3 rounded-[17px] bg-[#141412] p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img src={teamIcon} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-white">{team.name}</h2>
            <p className="mt-0.5 text-[14px] text-[#DA9811]">
              Owner: {team.owner}
            </p>
            <p className="mt-0.5 text-[12px] text-white">
              Icon Player: {team.iconPlayer}
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
              className="h-12 w-full rounded-[6px] bg-[#141412] py-3 pl-4 pr-12 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50"
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
            className="h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50"
            aria-label="Nick name"
          />
        </div>

        <div className="mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full border-collapse text-[12px] text-white">
            <thead>
              <tr className={HEADER_BG}>
                <th
                  className={`${HEADER_BG} border-b border-l border-r py-2.5 pl-4 text-left font-bold text-white ${BORDER}`}
                >
                  Player
                </th>
                <th
                  className={`${HEADER_BG} border-b border-r py-2.5 pr-4 text-right font-bold text-white ${BORDER}`}
                >
                  Playing Role
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => (
                <tr key={player.id}>
                  <td
                    className={`border-b border-l border-r py-3 pl-4 ${BORDER}`}
                  >
                    <p className="text-[12px] font-medium text-white">
                      {index + 1} {player.name}
                    </p>
                  </td>
                  <td
                    className={`border-b border-r py-3 pr-4 text-right text-white ${BORDER}`}
                  >
                    {player.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleSubmitSquad}
          className="h-12 px-4 text-center m-auto max-w-fit flex items-center justify-center rounded-[6px] border border-[#DA9811]  text-[16px] font-bold uppercase tracking-wide text-[#DA9811] transition-opacity active:opacity-90"
        >
          Submit Squad
        </button>
      </Container>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContentProfile className="!h-[250px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <span aria-hidden className="w-5" />
              <DialogClose
                className="rounded p-1 text-white/60 transition-colors hover:text-white focus:ring-2 focus:ring-[#FFB703] focus:outline-none"
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
                </svg>
              </DialogClose>
            </div>

            <DialogScrollBody className="flex flex-col items-center justify-center py-2 text-center">
              <div className="relative mb-3 flex h-14 w-14 shrink-0 items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                  <svg
                    className="h-7 w-7 text-[#E8A857]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11V4a3 3 0 0 1 3-3h2v10z" />
                  </svg>
                </div>
                <div
                  className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]"
                  aria-hidden
                >
                  <svg
                    className="h-3 w-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <h2 className="mb-1.5 text-[14px] font-bold text-white">
                Team has been submitted
              </h2>
              <p className="text-[13px] leading-snug text-[#A2A6AB]">
                If you need any changes please contact organizer
              </p>
            </DialogScrollBody>
          </div>
        </DialogContentProfile>
      </Dialog>
    </div>
  );
}
