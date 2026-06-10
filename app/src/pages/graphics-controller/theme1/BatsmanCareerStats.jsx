import PlayerLowerThirdPanel from './PlayerLowerThirdPanel';

export default function BatsmanCareerStats({ playerName = '', headline = 'Career Overview', stats = [] }) {
  const headerRight = <p className="text-[15px] leading-none font-semibold sm:text-[24px]">{headline}</p>;

  return <PlayerLowerThirdPanel playerName={playerName} headerRight={headerRight} stats={stats} />;
}
