import PlayerLowerThirdPanel from './PlayerLowerThirdPanel';

export default function BatsmanCurrentStats({
  playerName = '',
  runs = 0,
  balls = 0,
  isNotOut = false,
  stats = [],
}) {
  const runsDisplay = isNotOut ? `${runs}*` : String(runs);

  const headerRight = (
    <div className="flex items-baseline gap-1.5 sm:gap-3">
      <p className="text-[15px] leading-none font-extrabold sm:text-[28px]">
        {runsDisplay}
      </p>
      <p className="text-[8px] leading-none font-bold sm:text-[16px]">{balls}</p>
    </div>
  );

  return (
    <PlayerLowerThirdPanel
      playerName={playerName}
      headerRight={headerRight}
      stats={stats}
    />
  );
}
