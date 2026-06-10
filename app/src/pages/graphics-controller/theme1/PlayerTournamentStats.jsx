import { defaultTeamLogoUrl } from './playerGraphicTheme';
import {
  PlayerAvatarStage,
  PlayerIdentityBlurb,
  PlayerShowcasePage,
  PlayerShowcaseSection,
  PlayerVerticalStatList,
} from './PlayerShowcasePrimitives';

export default function PlayerTournamentStats({
  playerName = '',
  playerTeam = '',
  playerRole = '',
  playerImageUrl = null,
  stats = [],
}) {
  const teamLogo = defaultTeamLogoUrl;

  return (
    <PlayerShowcasePage>
      <PlayerShowcaseSection title="This Tournament">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-[1fr_114px_0.7fr] sm:items-end sm:gap-2">
          <PlayerAvatarStage playerName={playerName} playerImageUrl={playerImageUrl} />
          <PlayerVerticalStatList stats={stats} />
          <div>
            <img
              src={teamLogo}
              alt={playerTeam || 'Team'}
              className="mx-auto mb-8 h-[92px] w-[92px] rounded-full object-cover sm:h-[104px] sm:w-[104px]"
            />
            <PlayerIdentityBlurb
              playerName={playerName}
              playerTeam={playerTeam}
              playerRole={playerRole}
              secondaryTone="muted"
              dividerVariant="fade"
            />
          </div>
        </div>
      </PlayerShowcaseSection>
    </PlayerShowcasePage>
  );
}
