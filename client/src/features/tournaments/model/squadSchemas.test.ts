import { describe, expect, it } from 'vitest';

import {
  parseSquadOccupancy,
  playerDisplayName,
  playerInitials,
  shortTeamLabel,
  SQUAD_CAP,
  SQUAD_XI,
} from './squadSchemas';

describe('squadSchemas', () => {
  it('parses occupancy list', () => {
    const rows = parseSquadOccupancy({
      data: [
        {
          player_id: 7,
          player_name: 'Imran',
          team_id: 10,
          team_name: 'City Blues',
        },
      ],
      type: 'SUCCESS',
    });
    expect(rows).toEqual([{ playerId: 7, playerName: 'Imran', teamId: 10, teamName: 'City Blues' }]);
  });

  it('formats labels', () => {
    expect(shortTeamLabel('Karachi Kings XI')).toBe('Karachi Kings');
    expect(playerDisplayName({ name: null, nickname: 'sara' })).toBe('sara');
    expect(playerInitials('Sara Ali')).toBe('SA');
    expect(SQUAD_XI).toBe(11);
    expect(SQUAD_CAP).toBe(16);
  });
});
