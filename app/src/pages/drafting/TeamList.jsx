import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { useSearchTeamsQuery } from '@/store/api/teamApi';
import { Container } from '@/ui/Container';

const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;
const teamEditIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-edit-icon.svg`;

function teamDisplayMeta(team) {
  const owner = team?.sponsor?.name ?? '—';
  const iconPlayers =
    Array.isArray(team?.icon_players) && team.icon_players.length > 0
      ? team.icon_players
          .map((p) => p.name)
          .filter(Boolean)
          .join(', ')
      : '—';
  return { owner, iconPlayers };
}

function TeamCard({ team, index, onEdit, onDelete, onClick }) {
  const { owner, iconPlayers } = teamDisplayMeta(team);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(team)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.(team)}
      className="flex cursor-pointer items-start gap-3 rounded-[17px] bg-surface p-4 transition-opacity active:opacity-90"
    >
      <TeamLogo team={team} variant="draft" />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-bold text-white">{team.name ?? '—'}</h3>
        <p className="mt-0.5 text-[14px] text-muted">
          <span className="font-medium text-brand">Owner: {owner}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-muted">
          Icon Players: <span className="text-white">{iconPlayers}</span>
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
            aria-label="Edit Team"
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
            aria-label="Delete Team"
          >
            <img src={teamDeleteIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
        <span className="text-[28px] font-bold text-[#DA98113B]">{index + 1}</span>
      </div>
    </div>
  );
}

export default function TeamList() {
  const navigate = useNavigate();
  const { openDialog } = useDialog();

  const { data: teams = [], isLoading, isError } = useSearchTeamsQuery('');

  const handleTeamClick = (team) => {
    navigate(`/drafting/teams/${team.id}`, { state: { team } });
  };

  const handleEdit = (team) => openDialog('manageTeam', { mode: 'edit', team });

  const handleCreate = () => openDialog('manageTeam', { mode: 'create' });

  const handleDelete = (_team) => {
    // TODO: Confirm and delete team when API supports delete for app users
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Drafting" />
      <Container>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">Teams</h2>
          <button
            type="button"
            onClick={handleCreate}
            className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
          >
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-brand text-[18px] font-bold text-ink">
              +
            </span>
            <span className="text-[14px] font-semibold text-white">Create Teams</span>
          </button>
        </div>

        {isLoading && (
          <ul className="space-y-3 pb-10">
            {[1, 2, 3].map((i) => (
              <li key={i} className="animate-pulse rounded-[17px] bg-surface p-4">
                <div className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-surface-raised" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-surface-raised" />
                    <div className="h-3 w-32 rounded bg-surface-raised" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {isError && !isLoading && (
          <p className="rounded-[17px] bg-surface px-4 py-6 text-center text-[13px] text-red-400">Failed to load teams.</p>
        )}

        {!isLoading && !isError && teams.length > 0 && (
          <ul className="space-y-3 pb-10 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
            {teams.map((team, index) => (
              <li key={team.id ?? index}>
                <TeamCard team={team} index={index} onEdit={handleEdit} onDelete={handleDelete} onClick={handleTeamClick} />
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !isError && teams.length === 0 && (
          <p className="rounded-[17px] bg-surface px-4 py-6 text-center text-[13px] text-muted">
            No teams yet. Create your first team to get started.
          </p>
        )}
      </Container>
    </div>
  );
}
