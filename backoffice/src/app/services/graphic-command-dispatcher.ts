import type {
  GraphicCatalogAction,
  GraphicCatalogGroup,
  MatchGraphicCaption,
  MatchGraphicPlayerListsPayload,
} from './match-graphic.service';

export interface MatchGraphicPlayerPick {
  team_id: number;
  user_id: number;
}

export interface GraphicDispatchContext {
  caption: MatchGraphicCaption | null;
  captionsCount: number;
  playerLists: MatchGraphicPlayerListsPayload | null;
  selectedBatsman: MatchGraphicPlayerPick | null;
  selectedBowler: MatchGraphicPlayerPick | null;
  playerOfMatchUserId: number | null;
  batsmanPickOptionsCount?: number;
  bowlerPickOptionsCount?: number;
}

export type GraphicDispatchResult =
  | { kind: 'backoffice_only'; handler: 'open_caption_dialog' }
  | { kind: 'blocked'; message?: string }
  | { kind: 'send'; payload: Record<string, unknown> | null };

export function graphicActionKey(action: GraphicCatalogAction): string {
  return `${action.command_type}:${action.command_key}`;
}

export function isGraphicActionHidden(action: GraphicCatalogAction, ctx: GraphicDispatchContext): boolean {
  return action.category === 'backoffice_only' && !!action.requires?.caption && ctx.caption !== null;
}

export function isGraphicActionDisabled(action: GraphicCatalogAction, ctx: GraphicDispatchContext): boolean {
  if (action.requires?.caption && action.category !== 'backoffice_only' && ctx.captionsCount === 0) {
    return true;
  }

  if (action.requires?.player_of_match) {
    return ctx.playerOfMatchUserId == null;
  }

  const pick = action.requires?.player_pick;
  if (!pick) {
    return false;
  }

  if (!hasPlayerPickRoster(ctx.playerLists)) {
    return true;
  }

  if (pick === 'batsman') {
    if (ctx.batsmanPickOptionsCount === 0) {
      return true;
    }
    return ctx.selectedBatsman === null;
  }

  if (pick === 'bowler') {
    if (ctx.bowlerPickOptionsCount === 0) {
      return true;
    }
    return ctx.selectedBowler === null;
  }

  return false;
}

export function graphicActionTooltip(action: GraphicCatalogAction, ctx: GraphicDispatchContext): string {
  if (action.requires?.caption && action.category !== 'backoffice_only' && ctx.captionsCount === 0) {
    return 'Save a caption first';
  }

  if (action.requires?.player_of_match && ctx.playerOfMatchUserId == null) {
    return 'Set Man of the Match in the scoring app first';
  }

  return formatCommandToken(action.command_key);
}

export function resolveGraphicDispatch(action: GraphicCatalogAction, ctx: GraphicDispatchContext): GraphicDispatchResult {
  if (action.category === 'backoffice_only') {
    if (action.requires?.caption) {
      return { kind: 'backoffice_only', handler: 'open_caption_dialog' };
    }
    return { kind: 'blocked' };
  }

  if (action.requires?.caption) {
    if (!ctx.caption) {
      return { kind: 'blocked' };
    }
    return {
      kind: 'send',
      payload: {
        title: ctx.caption.title,
        description: ctx.caption.description,
      },
    };
  }

  if (action.requires?.playing_eleven_payload) {
    return {
      kind: 'send',
      payload: buildPlayingElevenPayload(ctx.playerLists),
    };
  }

  if (action.requires?.player_of_match) {
    if (ctx.playerOfMatchUserId == null) {
      return { kind: 'blocked', message: 'Set Man of the Match in the scoring app first.' };
    }
    return { kind: 'send', payload: null };
  }

  const playerPick = action.requires?.player_pick;
  if (playerPick === 'batsman') {
    if (!ctx.selectedBatsman) {
      return { kind: 'blocked', message: 'Select a batsman first.' };
    }
    return {
      kind: 'send',
      payload: {
        user_id: ctx.selectedBatsman.user_id,
        team_id: ctx.selectedBatsman.team_id,
      },
    };
  }

  if (playerPick === 'bowler') {
    if (!ctx.selectedBowler) {
      return { kind: 'blocked', message: 'Select a bowler first.' };
    }
    return {
      kind: 'send',
      payload: {
        user_id: ctx.selectedBowler.user_id,
        team_id: ctx.selectedBowler.team_id,
      },
    };
  }

  return { kind: 'send', payload: null };
}

export function buildPlayingElevenPayload(playerLists: MatchGraphicPlayerListsPayload | null): Record<string, unknown> {
  const home = playerLists?.home_team;
  const away = playerLists?.away_team;
  const mapRow = (p: {
    name: string;
    playing_role: string | null;
    batting_style?: string | null;
    bowling_style?: string | null;
  }) => ({
    name: p.name,
    playing_role: p.playing_role ?? null,
    batting_style: p.batting_style ?? null,
    bowling_style: p.bowling_style ?? null,
  });

  return {
    home_team: {
      name: home?.name ?? '',
      players: (home?.players ?? []).map(mapRow),
    },
    away_team: {
      name: away?.name ?? '',
      players: (away?.players ?? []).map(mapRow),
    },
  };
}

export function hasPlayerPickRoster(playerLists: MatchGraphicPlayerListsPayload | null): boolean {
  if (!playerLists) {
    return false;
  }
  return playerLists.home_team.players.length + playerLists.away_team.players.length > 0;
}

/** Uniform player-pick role when every action in the group requires the same pick. */
export function groupPlayerPickKind(group: Pick<GraphicCatalogGroup, 'actions'>): 'batsman' | 'bowler' | null {
  const kinds = group.actions.map((action) => action.requires?.player_pick).filter(Boolean);
  if (kinds.length === 0 || kinds.length !== group.actions.length) {
    return null;
  }
  const unique = new Set(kinds);
  return unique.size === 1 ? (kinds[0] as 'batsman' | 'bowler') : null;
}

export function isPlayerPickGroup(group: Pick<GraphicCatalogGroup, 'actions'>): boolean {
  return groupPlayerPickKind(group) != null;
}

export function formatCommandToken(token: string): string {
  return token
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Read player_of_match_user_id from the graphic session match slice. */
export function playerOfMatchUserIdFromContext(matchSlice: Record<string, unknown> | undefined): number | null {
  const raw = matchSlice?.['player_of_match_user_id'];
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
