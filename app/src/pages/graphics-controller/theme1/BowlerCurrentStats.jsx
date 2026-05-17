import PlayerLowerThirdPanel from './PlayerLowerThirdPanel';

export default function BowlerCurrentStats({ playerName = '', figures = '', overs = '', stats = [] }) {
  const headerRight = (
    <div className="flex items-baseline gap-1.5 sm:gap-3">
      <p className="text-[15px] leading-none font-extrabold sm:text-[28px]">{figures}</p>
      <p className="text-[8px] leading-none font-bold sm:text-[16px]">{overs}</p>
    </div>
  );

  return <PlayerLowerThirdPanel playerName={playerName} headerRight={headerRight} stats={stats} />;
}
