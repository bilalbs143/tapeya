import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { PlusIcon } from '@/shared/ui/icons';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { REEL_TAB_META, type ReelTab } from '../model/schemas';

type ReelsPageChromeProps = {
  desk: boolean;
  feedTab: ReelTab;
  onSelectTab: (tab: ReelTab) => void;
};

/** Gradient tab strip + upload affordance over the player. */
export function ReelsPageChrome({ desk, feedTab, onSelectTab }: ReelsPageChromeProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/55 to-transparent',
        desk ? 'pt-3' : 'pt-[max(12px,env(safe-area-inset-top))]'
      )}
    >
      <div className="pointer-events-auto flex items-center gap-2 px-4 pb-3">
        <Tabs value={feedTab} onValueChange={(v) => onSelectTab(v as ReelTab)} className="min-w-0 flex-1">
          <TabsList
            variant="underline"
            className="no-scrollbar w-full justify-center gap-3.5 overflow-x-auto border-0 bg-transparent p-0"
          >
            {REEL_TAB_META.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="shrink-0 rounded-none border-b-0 px-0 pb-1 text-xs text-white/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=active]:shadow-[inset_0_-2px_0_rgb(255_255_255)]"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          type="button"
          aria-label="Upload a Reel"
          onClick={() => navigate(APP_PATHS.createReel)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/14 text-white"
        >
          <PlusIcon size="sm" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
