import { playingXiRowMeta } from '@/lib/utils/playerUtils';

function TeamColumn({ teamName, players }) {
  return (
    <div className="w-full max-w-[340px]">
      <h3 className="mb-3 text-[18px] leading-none font-normal text-[#D4D4D4]">{teamName}</h3>
      <ul className="border-surface-border border bg-black/55">
        {players.map((raw, index) => {
          const { name, metaText, userId } = playingXiRowMeta(raw);
          const key = userId != null && typeof userId === 'number' ? `p-${userId}` : `${teamName}-${index}`;
          return (
            <li
              key={key}
              className="border-surface-border border-b px-9 py-3 text-[14px] font-normal text-[#E8E8E8] last:border-b-0"
            >
              <span className="block leading-none">{name}</span>
              {metaText ? <span className="text-muted mt-1.5 block text-[11px] leading-snug font-medium">{metaText}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function PlayingXI({ homeTeam = {}, awayTeam = {}, matchLabel = '', requiredRunRate = '', side = 'both' }) {
  const homeName = homeTeam.name || homeTeam.shortCode || 'Home';
  const awayName = awayTeam.name || awayTeam.shortCode || 'Away';
  const homePlayers = homeTeam.players ?? [];
  const awayPlayers = awayTeam.players ?? [];

  const both = side === 'both';
  const columns = both
    ? [
        [homeName, homePlayers],
        [awayName, awayPlayers],
      ]
    : [[side === 'home' ? homeName : awayName, side === 'home' ? homePlayers : awayPlayers]];

  const title = both ? 'Playing XI' : `Playing XI — ${columns[0][0]}`;

  return (
    <div className="bg-page flex min-h-screen items-center justify-center p-3 sm:p-5">
      <section className="relative w-full max-w-[677px] overflow-hidden bg-[#0D0806] pt-10 pb-8 text-white sm:pt-11 sm:pb-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/3 h-40 w-40 rounded-full bg-[#C57A12]/35 blur-3xl" />
          <div className="absolute top-24 right-16 h-28 w-28 rounded-full bg-[#E3A63B]/30 blur-2xl" />
          <div className="absolute bottom-24 left-8 h-36 w-36 rounded-full bg-[#A85E08]/35 blur-3xl" />
          <div className="absolute right-10 bottom-14 h-24 w-24 rounded-full bg-[#E8A020]/30 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="px-8 sm:px-12">
            <p className="mb-2 text-[18px] leading-none font-normal text-[#E9E9E9]">{title}</p>
            {matchLabel ? <p className="mb-6 text-[24px] leading-none font-semibold text-[#D89A18]">{matchLabel}</p> : null}
          </div>
          <div className="mb-6 h-px w-full bg-[#FFFFFF1C]" />

          <div className={`mb-2 flex items-start gap-10 px-8 sm:px-12 ${both ? 'justify-between' : 'justify-center'}`}>
            {columns.map(([name, players], i) => (
              <TeamColumn key={`${name}-${i}`} teamName={name} players={players} />
            ))}
          </div>

          {requiredRunRate ? (
            <p className="mt-3 text-center text-[20px] leading-none font-semibold text-[#DA9A10]">
              Required Run Rate: {requiredRunRate}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
