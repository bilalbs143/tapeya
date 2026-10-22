import { EmptyState } from '@/shared/ui/states';

export type PlayingElevenSide = {
  id: number;
  name: string;
  short: string;
  players: Array<{ id: number; name: string; role?: string | undefined }>;
};

type PlayingElevenPanelProps = {
  sides: PlayingElevenSide[];
};

export function PlayingElevenPanel({ sides }: PlayingElevenPanelProps) {
  if (!sides.length || sides.every((s) => s.players.length === 0)) {
    return <EmptyState title="Playing XI Not Set" description="Squads appear once both teams declare their eleven." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {sides.map((side) => (
        <section key={side.id}>
          <p className="font-mono text-dim mb-2 text-4xs leading-normal font-bold tracking-eyebrow uppercase">
            {side.name} · Playing XI
          </p>
          {side.players.length === 0 ? (
            <p className="text-muted text-xs">Not declared yet.</p>
          ) : (
            <ul className="border-border-subtle bg-surface overflow-hidden rounded-panel border">
              {side.players.map((p) => (
                <li
                  key={p.id}
                  className="border-border-subtle flex min-h-10 items-center gap-2 border-b px-3 last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate text-xs leading-normal font-bold text-ink">{p.name}</span>
                  {p.role ? (
                    <span className="font-mono text-dim text-4xs leading-normal font-bold tracking-[.08em] uppercase">
                      {p.role}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
