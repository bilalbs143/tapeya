import { graphicDebugLog, graphicLogger } from '../graphicDebugLog';
import { buildMatchCtx, normalizeBatters, normalizeTeam, resolveContextTeams } from './graphicPropsHelpers';

function scoreboardBase(ctx = {}) {
  const { home_team, away_team } = resolveContextTeams(ctx);
  const homeTeam = normalizeTeam(home_team);
  const awayTeam = normalizeTeam(away_team);
  const isBattingAway = (ctx.batting_team ?? 'home') === 'away';
  const battingTeam = {
    ...(isBattingAway ? awayTeam : homeTeam),
    score: ctx.score ?? '',
    overs: ctx.overs ?? '',
  };
  const bowlingTeam = isBattingAway ? homeTeam : awayTeam;
  return {
    battingTeam,
    bowlingTeam,
    batters: normalizeBatters(ctx.batters),
    bowler: {
      name: ctx.bowler?.name ?? '',
      figures: ctx.bowler?.figures ?? '',
      overs: ctx.bowler?.overs ?? '',
      userId: ctx.bowler?.user_id ?? null,
      runsConceded: ctx.bowler?.runs_conceded ?? null,
      ballsBowled: ctx.bowler?.balls_bowled ?? null,
      dots: ctx.bowler?.dots ?? null,
      wickets: ctx.bowler?.wickets ?? null,
      economy: ctx.bowler?.economy ?? null,
    },
    currentOverBalls: ctx.current_over_balls ?? [],
  };
}

/**
 * Intro / result / toss lower-thirds and live scoreboard strips.
 *
 * @param {string|null} commandKey
 * @param {Record<string, unknown>} ctx
 * @param {Record<string, unknown>} p
 * @returns {Record<string, unknown>|undefined}
 */
export function buildLowerThirdGraphicProps(commandKey, ctx, p) {
  switch (commandKey) {
    case 'INTRO_LT': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        matchLabel: mc.matchLabel,
      };
    }

    case 'RESULT_LT': {
      const mc = buildMatchCtx(ctx);
      const fromPayload = p.result_line != null && String(p.result_line).trim() !== '' ? String(p.result_line).trim() : '';
      const fromContext =
        ctx.match?.result_summary != null && String(ctx.match.result_summary).trim() !== ''
          ? String(ctx.match.result_summary).trim()
          : '';
      const resultLine = fromPayload || fromContext;
      const winningTeam = p.winning_team ?? ctx.match?.winning_team ?? null;
      graphicDebugLog('RESULT_LT', {
        commandKey,
        contextMatch: ctx.match ?? null,
        contextKeys: ctx && typeof ctx === 'object' ? Object.keys(ctx) : [],
        payload: p,
        fromPayload,
        fromContext,
        resultLine,
        winningTeam,
      });
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        resultLine,
        winningTeam,
      };
    }

    case 'TOSS_LT': {
      const mc = buildMatchCtx(ctx);
      const fromPayload = p.decision != null && String(p.decision).trim() !== '' ? String(p.decision).trim() : '';
      const m = ctx.match ?? {};
      const side = m.toss_winner_side;
      const choice = m.chose_to_bat_or_bowl;
      const winnerName = side === 'home' ? mc.homeTeam.name : side === 'away' ? mc.awayTeam.name : '';
      let fromContext = '';
      if (winnerName && (choice === 'bat' || choice === 'bowl')) {
        const elected = choice === 'bat' ? 'elected to bat first' : 'elected to bowl first';
        fromContext = `${winnerName} won the toss and ${elected}`;
      }
      const decision = fromPayload || fromContext;
      graphicLogger('info', 'TOSS_LT.buildGraphicProps', {
        commandKey,
        contextKeys: ctx && typeof ctx === 'object' ? Object.keys(ctx) : [],
        contextMatch: m,
        toss_winner_side: side,
        chose_to_bat_or_bowl: choice,
        winnerName,
        homeName: mc.homeTeam.name,
        awayName: mc.awayTeam.name,
        fromPayload,
        fromContext,
        decision,
        payloadRaw: p,
      });
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        decision,
      };
    }

    case 'LT_DEFAULT':
      return scoreboardBase(ctx);

    case 'MINI_SCORECARD':
      return scoreboardBase(ctx);

    case 'MATCH_SUMMARY': {
      const mc = buildMatchCtx(ctx);
      const matchup = [mc.homeTeam.shortCode || mc.homeTeam.name, mc.awayTeam.shortCode || mc.awayTeam.name]
        .filter(Boolean)
        .join(' vs ');
      return {
        ...scoreboardBase(ctx),
        matchup,
        tournamentLabel: mc.matchLabel,
        stats: Array.isArray(p.stats) ? p.stats : [],
      };
    }

    case 'RUN_RATE':
      return {
        ...scoreboardBase(ctx),
        target: ctx.target ?? null,
        currentRR: ctx.current_rr ?? '',
        requiredRR: ctx.required_rr ?? '',
      };

    case 'CURRENT_PARTNERSHIP':
    case 'CURRENT_PARTNERSHIP_FS':
    case 'PARTNERSHIP_LIST':
      return {
        ...scoreboardBase(ctx),
        partnershipRuns: ctx.partnership?.runs ?? 0,
        partnershipBalls: ctx.partnership?.balls ?? 0,
      };

    case 'LAST_12_BALLS': {
      const s = ctx.last_12_balls ?? {};
      return {
        ...scoreboardBase(ctx),
        ballsLabel: 'Last 12 Balls',
        dots: s.dots ?? 0,
        fours: s.fours ?? 0,
        sixes: s.sixes ?? 0,
        wickets: s.wickets ?? 0,
        runs: s.runs ?? 0,
      };
    }

    case 'LAST_30_BALLS': {
      const s = ctx.last_30_balls ?? {};
      return {
        ...scoreboardBase(ctx),
        ballsLabel: 'Last 30 Balls',
        dots: s.dots ?? 0,
        fours: s.fours ?? 0,
        sixes: s.sixes ?? 0,
        wickets: s.wickets ?? 0,
        runs: s.runs ?? 0,
      };
    }

    case 'THIS_OVER': {
      const s = ctx.this_over ?? {};
      return {
        ...scoreboardBase(ctx),
        ballsLabel: 'This Over',
        dots: s.dots ?? 0,
        fours: s.fours ?? 0,
        sixes: s.sixes ?? 0,
        wickets: s.wickets ?? 0,
        runs: s.runs ?? 0,
      };
    }

    case 'PREVIOUS_OVER':
      return {
        ...scoreboardBase(ctx),
        lastOverRuns: ctx.previous_over?.runs ?? p.last_over_runs ?? 0,
      };

    case 'NEED_TARGET':
    case 'NEED_TARGET_FS':
    case 'FDR':
      return {
        ...scoreboardBase(ctx),
        runsToWin: ctx.runs_to_win ?? 0,
        ballsRemaining: ctx.balls_remaining ?? 0,
      };

    case 'LAST_WICKET':
    case 'LAST_WICKET_FS': {
      const fow = ctx.fall_of_wickets ?? p.wickets ?? [];
      return {
        ...scoreboardBase(ctx),
        wickets: Array.isArray(fow) ? fow : [],
      };
    }

    case 'AT_STAGE': {
      const base = scoreboardBase(ctx);
      const m = ctx.at_stage_mirror;
      const hasMirror = m != null && typeof m === 'object' && (m.batting_team === 'home' || m.batting_team === 'away');
      if (hasMirror) {
        const teams = resolveContextTeams(ctx);
        const raw = m.batting_team === 'away' ? teams.away_team : teams.home_team;
        const nt = normalizeTeam(raw);
        return {
          ...base,
          mirrorBattingTeam: {
            ...nt,
            score: m.score ?? '',
            overs: m.overs ?? '',
          },
          mirrorBatters: normalizeBatters(m.batters),
          mirrorBowler: m.bowler ?? { name: '', figures: '', overs: '' },
          mirrorCurrentOverBalls: Array.isArray(m.current_over_balls) ? m.current_over_balls : [],
          mirrorInningsLabel: m.innings_label ?? '1st Innings',
          comparisonTeamName: '',
          comparisonScore: '',
          comparisonOvers: '',
        };
      }
      const comp = p.comparison_team ?? {};
      return {
        ...base,
        mirrorBattingTeam: null,
        mirrorBatters: [],
        mirrorBowler: { name: '', figures: '', overs: '' },
        mirrorCurrentOverBalls: [],
        mirrorInningsLabel: '',
        comparisonTeamName: comp.name ?? '',
        comparisonScore: comp.score ?? '',
        comparisonOvers: comp.overs ?? '',
      };
    }

    case 'WIN_PREDICTION': {
      const wp = ctx.win_probability;
      const hasProb =
        wp &&
        typeof wp === 'object' &&
        wp.home != null &&
        wp.away != null &&
        Number.isFinite(Number(wp.home)) &&
        Number.isFinite(Number(wp.away));
      return {
        ...scoreboardBase(ctx),
        winProbHome: hasProb ? Number(wp.home) : null,
        winProbAway: hasProb ? Number(wp.away) : null,
      };
    }

    default:
      return undefined;
  }
}
