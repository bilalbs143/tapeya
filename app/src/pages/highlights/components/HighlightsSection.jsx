import { HighlightCard } from '@/pages/highlights/components/HighlightCard';

export function HighlightsSection({ title, highlights, onCardClick }) {
  if (highlights.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase md:text-[16px]">{title}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {highlights.map((highlight) => (
          <HighlightCard key={`${title}-${highlight.id}`} highlight={highlight} onClick={onCardClick} />
        ))}
      </div>
    </section>
  );
}
