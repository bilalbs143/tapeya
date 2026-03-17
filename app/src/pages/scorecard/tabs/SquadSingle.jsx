import { BORDER_ALT } from '@/lib/constants/tableStyles';
import { playerDisplayRole } from '@/lib/utils/playerUtils';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';

export function SquadSingle({ tournamentId, teamId }) {
  const {
    data: squad = [],
    isLoading,
    isError,
  } = useGetTeamSquadQuery(teamId, {
    skip: !teamId,
  });

  if (!teamId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-[#A2A6AB]">
          Loading squad…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">
          Failed to load squad.
        </p>
      </div>
    );
  }

  if (!squad.length) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
          No players in this squad yet.
        </p>
      </div>
    );
  }

  const title = tournamentId ? `${tournamentId} - Squad` : 'Squad';

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-b border-[#1A1A1A] pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="overflow-hidden border border-[#1A1A1A]">
        <div className="bg-[#141412] px-4 py-3 text-[13px] font-bold text-white">
          Players
        </div>
        <div className="border-t border-[#1A1A1A]">
          {squad.map((player, index) => (
            <div
              key={player.id ?? index}
              className={`flex border-b ${BORDER_ALT} last:border-b-0`}
            >
              <div
                className={`flex w-10 shrink-0 items-center justify-center border-r ${BORDER_ALT} py-3 text-[13px] text-white`}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1 px-4 py-3">
                <p className="text-[13px] font-bold text-white">
                  {player.name ?? player.nickname ?? 'Player'}
                </p>
                <div className="mt-0.5 text-[12px] text-[#A2A6AB]">
                  {playerDisplayRole(player)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
