import { TabsList, TabsTrigger } from '@/shared/ui/Tabs';

type ScoringDeskTabBarProps = {
  onOpenMore: () => void;
};

/** Pill tabs (Scoring / Scorecard / Balls) + More. */
export function ScoringDeskTabBar({ onOpenMore }: ScoringDeskTabBarProps) {
  return (
    <div className="mx-4 flex shrink-0 items-center gap-2">
      <TabsList variant="pill" className="min-w-0 flex-1 justify-start">
        <TabsTrigger value="pad">Scoring</TabsTrigger>
        <TabsTrigger value="card">Scorecard</TabsTrigger>
        <TabsTrigger value="balls">Balls</TabsTrigger>
      </TabsList>
      <button
        type="button"
        onClick={onOpenMore}
        className="text-dim hover:text-ink focus-visible:outline-brand -mx-1 -my-2 shrink-0 rounded-chip px-2 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-1"
      >
        More
      </button>
    </div>
  );
}
