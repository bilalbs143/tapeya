import { BORDER_ALT } from '@/lib/constants/tableStyles';
import { formatListIndex } from '@/lib/format';
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
        <p className="py-4 text-center text-[13px] text-muted">Loading squad…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-4 text-center text-[13px] text-red-400">Failed to load squad.</p>
      </div>
    );
  }

  if (!squad.length) {
    return (
      <div className="mt-4 pb-6">
        <p className="py-8 text-center text-[13px] text-muted">No players in this squad yet.</p>
      </div>
    );
  }

  const title = tournamentId ? `${tournamentId} - Squad` : 'Squad';

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="border-b border-surface-border pb-4 text-left text-[13px] font-bold tracking-wide text-white uppercase">
        {title}
      </h1>

      <div className="overflow-hidden border border-surface-border">
        <div className="bg-surface px-4 py-3 text-[13px] font-bold text-white">Players</div>
        <div className="border-t border-surface-border">
          {squad.map((player, index) => (
            <div key={player.id ?? index} className={`flex border-b ${BORDER_ALT} last:border-b-0`}>
              <div
                className={`flex w-10 shrink-0 items-center justify-center border-r ${BORDER_ALT} py-3 text-[13px] text-white`}
              >
                {formatListIndex(index + 1)}
              </div>
              <div className="min-w-0 flex-1 px-4 py-3">
                <p className="text-[13px] font-bold text-white">{player.name ?? player.nickname ?? 'Player'}</p>
                <div className="mt-0.5 text-[12px] text-muted">{playerDisplayRole(player)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
