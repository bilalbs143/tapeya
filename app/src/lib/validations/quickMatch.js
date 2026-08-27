import { z } from 'zod';

import { QUICK_MATCH_NAME_REGEX } from '@/lib/validations/quickMatchWalkUp';

import { phoneSchema } from './shared';

const existingPlayerSchema = z.object({
  user_id: z.number().int().positive(),
  name: z.string().optional(),
  nickname: z.string().optional(),
});

const walkUpPlayerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').regex(QUICK_MATCH_NAME_REGEX, 'Name may only contain letters and spaces'),
  phone: phoneSchema,
});

const playerSchema = z.union([existingPlayerSchema, walkUpPlayerSchema]);

const sideSchema = z
  .object({
    team_id: z.union([z.number().int().positive(), z.literal(''), z.null()]).optional(),
    name: z.string().trim().max(255).optional().default(''),
    players: z.array(playerSchema).min(1, 'Add at least one player'),
  })
  .superRefine((side, ctx) => {
    const hasTeam = side.team_id != null && side.team_id !== '';
    if (!hasTeam && !side.name?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Team name is required', path: ['name'] });
    }
  });

/**
 * Quick Match wizard schema — aligns with StoreQuickMatchRequest.
 * Venue is always null; date/time default to now on the server.
 */
export const quickMatchSchema = z
  .object({
    cricket_format: z.string().min(1, 'Select ball type'),
    overs: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((n) => Number.isInteger(n) && n >= 1 && n <= 255, 'Enter 1–255 overs'),
    players_per_side: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((n) => Number.isInteger(n) && n >= 2 && n <= 20, 'Select 2–20 players per side'),
    home: sideSchema,
    away: sideSchema,
  })
  .superRefine((data, ctx) => {
    const pps = Number(data.players_per_side);
    for (const side of ['home', 'away']) {
      const count = data[side].players.length;
      if (count > pps) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `At most ${pps} players per side`,
          path: [side, 'players'],
        });
      }
    }

    const homeTeamId = data.home.team_id || null;
    const awayTeamId = data.away.team_id || null;
    if (homeTeamId && awayTeamId && Number(homeTeamId) === Number(awayTeamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Home and away must be different teams',
        path: ['away', 'team_id'],
      });
    }

    const homeIds = data.home.players.filter((p) => p.user_id != null).map((p) => Number(p.user_id));
    const awayIds = data.away.players.filter((p) => p.user_id != null).map((p) => Number(p.user_id));
    const overlap = homeIds.filter((id) => awayIds.includes(id));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A player cannot appear on both sides',
        path: ['away', 'players'],
      });
    }
  });

/**
 * Build API body from validated wizard values.
 * @param {z.infer<typeof quickMatchSchema>} data
 * @param {{ winning_side: 'home'|'away', chose_to_bat_or_bowl: string }|null} [toss]
 */
export function buildQuickMatchPayload(data, toss = null) {
  const mapSide = (side) => {
    const players = side.players.map((p) =>
      p.user_id != null ? { user_id: Number(p.user_id) } : { name: p.name.trim(), phone: p.phone },
    );
    if (side.team_id) {
      return { team_id: Number(side.team_id), players };
    }
    return { name: side.name.trim(), players };
  };

  const payload = {
    cricket_format: data.cricket_format,
    overs: Number(data.overs),
    players_per_side: Number(data.players_per_side),
    home: mapSide(data.home),
    away: mapSide(data.away),
  };

  if (toss) payload.toss = toss;

  return payload;
}

/** First user-facing Zod / RHF error message from form errors. */
export function firstQuickMatchFormError(errors) {
  if (!errors || typeof errors !== 'object') return null;
  const prefer = [
    errors.cricket_format,
    errors.overs,
    errors.players_per_side,
    errors.home?.name,
    errors.home?.players,
    errors.away?.name,
    errors.away?.players,
    errors.away?.team_id,
  ];
  for (const node of prefer) {
    const msg = node?.message || node?.root?.message;
    if (msg) return msg;
  }
  return 'Fix the highlighted fields, then try again.';
}
