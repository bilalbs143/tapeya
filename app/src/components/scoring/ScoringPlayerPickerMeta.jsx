import { playerPickerMetaSegments } from '@/lib/utils/playerUtils';

/**
 * Secondary line under a player name in scoring pickers (role + bat/bowl styles).
 *
 * @param {{ playing_role?: string, playing_role_enum?: string, batting_style?: string, batting_style_enum?: string, bowling_style?: string, bowling_style_enum?: string } | null | undefined} player
 * @param {'batting'|'bowling'|'fielder'} variant
 */
export function ScoringPlayerPickerMeta({ player, variant }) {
  const segments = playerPickerMetaSegments(player, variant);
  if (segments.length === 0) return null;
  return <p className="text-muted mt-1 text-[11px] leading-snug font-medium">{segments.join(' · ')}</p>;
}

export default ScoringPlayerPickerMeta;
