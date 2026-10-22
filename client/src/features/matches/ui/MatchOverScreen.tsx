import type { MatchOverInnings, MotmCandidate } from '../lib/matchOver';
import { MatchOverBody } from './MatchOverBody';
import { useMatchOver } from './useMatchOver';

export type { MatchOverInnings, MotmCandidate } from '../lib/matchOver';

type MatchOverScreenProps = {
  matchId: number;
  resultSummary: string | null;
  homeShort: string;
  awayShort: string;
  homeXi: MotmCandidate[];
  awayXi: MotmCandidate[];
  canOperate: boolean;
  existingMotmName?: string | null | undefined;
  innings?: MatchOverInnings[] | undefined;
  subtitle?: string | null | undefined;
};

/** Candidates from either XI (legacy `ManOfTheMatchDialog` / app scoringUtils). */
export function MatchOverScreen({
  matchId,
  resultSummary,
  homeShort,
  awayShort,
  homeXi,
  awayXi,
  canOperate,
  existingMotmName,
  innings = [],
  subtitle,
}: MatchOverScreenProps) {
  const flow = useMatchOver({
    matchId,
    resultSummary,
    homeShort,
    awayShort,
    homeXi,
    awayXi,
    canOperate,
    existingMotmName,
  });

  return (
    <MatchOverBody
      flow={flow}
      resultSummary={resultSummary}
      homeShort={homeShort}
      awayShort={awayShort}
      canOperate={canOperate}
      innings={innings}
      subtitle={subtitle}
    />
  );
}
