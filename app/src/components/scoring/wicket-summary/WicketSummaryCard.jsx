function StatBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-brand text-[10px] font-bold tracking-wide uppercase">{label}</span>
      <span className="text-[15px] font-bold text-white">{value}</span>
    </div>
  );
}

function MetaRow({ label, value }) {
  if (value == null || value === '—') return null;
  return (
    <div className="flex items-start justify-between gap-3 text-[12px]">
      <span className="text-muted shrink-0 font-medium">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

/**
 * Out batter summary card — dark panel matching scoring tables / dialogs.
 */
export function WicketSummaryCard({
  batter,
  bowlerName,
  fielderName,
  showBowler,
  showFielder,
  showCreaseTime,
  showFours,
  showSixes,
  showStrikeRate,
}) {
  if (!batter) return null;

  const statItems = [
    showFours ? { label: '4s', value: batter.fours } : null,
    showSixes ? { label: '6s', value: batter.sixes } : null,
    showStrikeRate ? { label: 'SR', value: batter.strikeRate } : null,
  ].filter(Boolean);

  const initial = (batter.name ?? '?').charAt(0).toUpperCase();

  return (
    <div className="border-border-subtle bg-surface overflow-hidden rounded-[17px] border">
      <div className="border-border-subtle border-b bg-black/40 px-4 py-2">
        <p className="text-brand text-[10px] font-bold tracking-widest uppercase">Out Batter</p>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4">
          <span
            className="text-brand flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#10100F] text-xl font-bold ring-2 ring-[#282824]"
            aria-hidden
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold text-white">{batter.name}</p>
            <p className="text-brand mt-0.5 text-[14px] font-semibold">
              {batter.runs}
              <span className="text-muted font-medium"> ({batter.balls})</span>
            </p>
          </div>
        </div>

        {(showCreaseTime || showBowler || showFielder) && (
          <div className="border-border-subtle mt-4 space-y-2 border-t pt-3">
            {showCreaseTime ? <MetaRow label="Crease Time" value={batter.creaseTime} /> : null}
            {showBowler ? <MetaRow label="Bowler" value={bowlerName} /> : null}
            {showFielder ? <MetaRow label="Fielder" value={fielderName} /> : null}
          </div>
        )}

        {statItems.length > 0 ? (
          <div
            className="border-border-subtle mt-4 grid gap-3 border-t pt-4"
            style={{ gridTemplateColumns: `repeat(${statItems.length}, minmax(0, 1fr))` }}
          >
            {statItems.map((item) => (
              <StatBlock key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
