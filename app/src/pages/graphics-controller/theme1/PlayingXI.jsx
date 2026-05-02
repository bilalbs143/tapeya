const TEAM_ONE_PLAYERS = Array.from(
  { length: 11 },
  (_, index) => `Player ${index + 1}`,
);
const TEAM_TWO_PLAYERS = Array.from(
  { length: 11 },
  (_, index) => `Player ${index + 1}`,
);

function TeamColumn({ teamName, players }) {
  return (
    <div className="w-full max-w-[340px]">
      <h3 className="mb-3 text-[18px] leading-none font-normal text-[#D4D4D4]">
        {teamName}
      </h3>
      <ul className="border border-[#1A1A1A] bg-black/55">
        {players.map((playerName) => (
          <li
            key={`${teamName}-${playerName}`}
            className="border-b border-[#1A1A1A] px-9 py-3 text-[14px] leading-none font-normal text-[#E8E8E8] last:border-b-0"
          >
            {playerName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlayingXI() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section className="relative w-full max-w-[677px] overflow-hidden bg-[#0D0806] pt-10 pb-8 text-white sm:pt-11 sm:pb-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/3 h-40 w-40 rounded-full bg-[#C57A12]/35 blur-3xl" />
          <div className="absolute top-24 right-16 h-28 w-28 rounded-full bg-[#E3A63B]/30 blur-2xl" />
          <div className="absolute bottom-24 left-8 h-36 w-36 rounded-full bg-[#A85E08]/35 blur-3xl" />
          <div className="absolute right-10 bottom-14 h-24 w-24 rounded-full bg-[#E8A020]/30 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="px-8 sm:px-12">
            <p className="mb-2 text-[18px] leading-none font-normal text-[#E9E9E9]">
              Playing XI
            </p>
            <p className="mb-6 text-[24px] leading-none font-semibold text-[#D89A18]">
              Tournament (Match 7)
            </p>
          </div>
          <div className="mb-6 h-px w-full bg-[#FFFFFF1C]" />

          <div className="mb-2 flex items-start justify-between gap-10 px-8 sm:px-12">
            <TeamColumn teamName="Team 1" players={TEAM_ONE_PLAYERS} />
            <TeamColumn teamName="Team 2" players={TEAM_TWO_PLAYERS} />
          </div>

          <p className="mt-3 text-center text-[20px] leading-none font-semibold text-[#DA9A10]">
            Required Run :13.50
          </p>
        </div>
      </section>
    </div>
  );
}
