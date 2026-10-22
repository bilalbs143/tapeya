import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { EmptyState } from '@/shared/ui/states';

import { entertainmentEpisodeBadge, entertainmentEpisodeViewsLabel } from '../lib/entertainmentDetail';
import { entertainmentPaths } from '../lib/entertainmentPaths';
import type { DramaSerial } from '../model/schemas';

type EntertainmentDetailBodyProps = {
  serial: DramaSerial;
  onBack: () => void;
};

/** Show description + episode rows. */
export function EntertainmentDetailBody({ serial, onBack }: EntertainmentDetailBodyProps) {
  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title={serial.title} subtitle="Episodes" onBack={onBack} />

      <div className="flex flex-col gap-5 px-4 pt-3.5 pb-8">
        {serial.description ? <p className="text-muted text-2xs leading-relaxed">{serial.description}</p> : null}

        <section className="flex flex-col gap-2.5">
          <h2 className="font-mono text-muted text-3xs font-bold tracking-eyebrow uppercase">Episodes</h2>
          {serial.episodes.length === 0 ? (
            <EmptyState title="No Episodes Yet" description="Episodes will appear here when published." />
          ) : (
            <ul className="flex flex-col gap-2">
              {serial.episodes.map((ep) => (
                <li key={ep.id}>
                  <Link
                    to={entertainmentPaths.episode(serial.id, ep.id)}
                    className="border-border-subtle hover:bg-surface-raised flex w-full items-center gap-3 rounded-panel border p-2.5 text-left"
                  >
                    <span className="bg-surface-raised relative h-14 w-24 shrink-0 overflow-hidden rounded-field">
                      {ep.thumbnail ? <img src={ep.thumbnail} alt="" className="h-full w-full object-cover" /> : null}
                      <span className="bg-brand absolute bottom-1 left-1 rounded-chip px-1.5 py-0.5 font-mono text-4xs font-bold text-white">
                        {entertainmentEpisodeBadge(ep.episodeNumber)}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-xs font-bold text-ink">{ep.title}</span>
                      <span className="text-dim mt-0.5 block text-3xs">
                        {entertainmentEpisodeViewsLabel(ep.viewsCount)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
