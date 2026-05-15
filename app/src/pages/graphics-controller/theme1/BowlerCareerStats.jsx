import PlayerLowerThirdPanel from './PlayerLowerThirdPanel';

export default function BowlerCareerStats({
  playerName = '',
  headline = 'Career Stats',
  stats = [],
}) {
  const headerRight = (
    <p className="text-[15px] leading-none font-bold sm:text-[28px]">{headline}</p>
  );

  return (
    <PlayerLowerThirdPanel
      playerName={playerName}
      headerRight={headerRight}
      stats={stats}
    />
  );
}
