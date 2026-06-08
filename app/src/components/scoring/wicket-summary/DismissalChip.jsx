/**
 * Dismissal type badge — dark theme with wicket red accent.
 */
export function DismissalChip({ label }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-1 text-[11px] font-bold tracking-wide text-[#FCA5A5] uppercase">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF4444]" aria-hidden />
      {label}
    </span>
  );
}
