import { UserAvatar } from '@/components/UserAvatar';
import { getInitials } from '@/lib/utils/displayUtils';
import { formatPhoneFull } from '@/lib/utils/phoneUtils';

const ROW_BUTTON_CLASS =
  'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-60';

const PILL_BUTTON_CLASS =
  'bg-surface flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition-colors focus:outline-none active:opacity-90 disabled:opacity-60';

const NAME_CLASS = {
  row: 'block truncate font-semibold text-white',
  pill: 'block truncate text-[14px] font-medium text-white',
};

/** Compact "@nickname · +92 315 711 8511" identity line — nickname and/or phone, whichever exist. */
function identityLine(player) {
  const parts = [player?.nickname ? `@${player.nickname}` : null, player?.phone ? formatPhoneFull(player.phone) : null].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * One row in a "search / pick a player" list — the shared building block behind every
 * Find/Add Player flow (Quick Match, live scoring squad, tournament squad, team drafting,
 * team sponsor search). Renders an avatar (photo or initials) + name + a compact
 * nickname/phone identity line, so the same person can be told apart from same-named others.
 *
 * variant:
 *  - 'row'  (default) — a search-results dropdown item, wrapped in its own <li>.
 *    Caller supplies the surrounding <ul>.
 *  - 'pill' — a standalone rounded pill (e.g. "Your Players" quick-add list), no <li>.
 */
export function PlayerSearchResultRow({ player, onClick, disabled = false, variant = 'row' }) {
  const name = player?.name ?? player?.nickname ?? '—';
  const secondary = identityLine(player);

  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={variant === 'pill' ? PILL_BUTTON_CLASS : ROW_BUTTON_CLASS}
    >
      <UserAvatar name={name} size="sm" fallback={getInitials(player?.name, player?.nickname)} />
      <span className="min-w-0 flex-1">
        <span className={NAME_CLASS[variant] ?? NAME_CLASS.row}>{name}</span>
        {secondary ? <span className="text-muted block truncate text-[13px]">{secondary}</span> : null}
      </span>
    </button>
  );

  return variant === 'pill' ? button : <li>{button}</li>;
}

export default PlayerSearchResultRow;
