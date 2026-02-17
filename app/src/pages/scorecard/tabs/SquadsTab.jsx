import { MOCK_SQUADS } from './squadsData';

const BORDER = 'border-[#1A1A1A]';

export function SquadsTab({ tournamentId }) {
  const title = tournamentId
    ? `${tournamentId} 2026 - KARACHI KIDS SQUAD`
    : 'SQUAD';
  const squad = MOCK_SQUADS[0];
  const players = squad?.players ?? [];

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold uppercase tracking-wide text-white">
        {title}
      </h1>

      <div className="overflow-hidden rounded-md border border-[#1A1A1A]">
        <div className="rounded-t-md bg-[#252525] px-4 py-3 text-[13px] font-bold text-white">
          {squad?.teamName ?? 'Squad'}
        </div>
        <div className="border-t border-[#1A1A1A]">
          {players.map((player, index) => (
            <div
              key={index}
              className={`flex border-b ${BORDER} last:border-b-0`}
            >
              <div
                className={`flex w-10 shrink-0 items-center justify-center border-r ${BORDER} py-3 text-[13px] text-white`}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1 px-4 py-3">
                <div className="text-[13px] font-bold text-white">
                  {player.name}
                </div>
                <div className="mt-0.5 text-[12px] text-[#A2A6AB]">
                  {player.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
