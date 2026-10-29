import { useNavigate } from 'react-router-dom';

import { liveRoutes } from '@/features/live';

import { shareLink } from '@/shared/native/share';
import { Button } from '@/shared/ui/Button';
import { PlayIcon, ShareIcon } from '@/shared/ui/icons';
import { toast } from '@/shared/ui/toast';

type FanLiveDockProps = {
  streamId: number | null;
  homeShort: string;
  awayShort: string;
  onOpenScorecard: () => void;
};

export function FanLiveDock({ streamId, homeShort, awayShort, onOpenScorecard }: FanLiveDockProps) {
  const navigate = useNavigate();
  const streamTo = streamId != null ? liveRoutes.broadcast(streamId) : liveRoutes.list();

  return (
    <div className="border-border-subtle bg-veil/95 flex shrink-0 items-center gap-2 border-t px-4 pt-3 pb-3 backdrop-blur-lg tab:hidden">
      <Button className="min-h-12 flex-1 rounded-field text-body-sm font-bold" onClick={() => navigate(streamTo)}>
        <span className="inline-flex items-center gap-2">
          <PlayIcon size="xs" strokeWidth={2} className="h-[15px] w-[15px]" />
          Watch Stream
        </span>
      </Button>
      <Button
        variant="secondary"
        className="min-h-12 rounded-field px-4 text-body-sm leading-normal font-semibold"
        onClick={onOpenScorecard}
      >
        Scorecard
      </Button>
      <Button
        variant="secondary"
        aria-label="Share"
        className="min-h-12 w-12 shrink-0 rounded-field px-0"
        onClick={() => {
          void (async () => {
            if (typeof window === 'undefined') return;
            const result = await shareLink({
              title: `${homeShort} vs ${awayShort} — Tapeya`,
              url: window.location.href,
            });
            if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
          })();
        }}
      >
        <ShareIcon size="sm" strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
}
