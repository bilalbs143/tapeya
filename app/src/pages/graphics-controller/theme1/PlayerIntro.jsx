import { defaultTeamLogoUrl } from './playerGraphicTheme';
import {
  PlayerAvatarStage,
  PlayerIdentityBlurb,
  PlayerShowcasePage,
  PlayerShowcaseSection,
} from './PlayerShowcasePrimitives';

export default function PlayerIntro({
  playerName = '',
  playerTeam = '',
  playerRole = '',
  playerImageUrl = null,
  stats: _stats = [],
}) {
  const teamLogo = defaultTeamLogoUrl;

  return (
    <PlayerShowcasePage>
      <PlayerShowcaseSection title="Player Intro">
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-7 sm:grid-cols-[1fr_0.85fr] sm:items-end sm:gap-6">
          <PlayerAvatarStage
            playerName={playerName}
            playerImageUrl={playerImageUrl}
          />

          <div>
            <img
              src={teamLogo}
              alt={playerTeam || 'Team'}
              className="mx-auto mb-16 h-[92px] w-[92px] rounded-full object-cover sm:h-[104px] sm:w-[104px]"
            />
            <PlayerIdentityBlurb
              playerName={playerName}
              playerTeam={playerTeam}
              playerRole={playerRole}
              secondaryTone="accent"
              dividerVariant="solid"
            />
          </div>
        </div>
      </PlayerShowcaseSection>
    </PlayerShowcasePage>
  );
}
