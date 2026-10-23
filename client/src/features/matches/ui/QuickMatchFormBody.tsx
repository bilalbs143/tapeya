import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { NumberStepper } from '@/shared/ui/NumberStepper';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import {
  QUICK_MATCH_OVERS_MAX,
  QUICK_MATCH_OVERS_MIN,
  QUICK_MATCH_PLAYERS_MAX,
  QUICK_MATCH_PLAYERS_MIN,
} from '../lib/quickMatchForm';
import { AddQuickMatchPlayerSheet } from './AddQuickMatchPlayerSheet';
import { QuickMatchChoiceChip, QuickMatchRoster, QuickMatchVersusCard } from './QuickMatchSetupPanels';
import type { useQuickMatchForm } from './useQuickMatchForm';

type QuickMatchFormFlow = ReturnType<typeof useQuickMatchForm>;

type QuickMatchFormBodyProps = {
  flow: QuickMatchFormFlow;
};

/** Setup form, sticky save/toss bar, and add-player sheet for QuickMatchPage. */
export function QuickMatchFormBody({ flow }: QuickMatchFormBodyProps) {
  const {
    isLoading,
    ballTypes,
    enumsLoading,
    enumsError,
    refetchEnums,
    homeName,
    setHomeName,
    awayName,
    setAwayName,
    homePlayers,
    setHomePlayers,
    awayPlayers,
    setAwayPlayers,
    adding,
    setAdding,
    overs,
    setOvers,
    players,
    setSideSize,
    resolvedBall,
    setBall,
    gate,
    takenIds,
    ballLabel,
    status,
    addPlayer,
    start,
  } = flow;

  return (
    <>
      <Form density="compact" className="flex flex-1 flex-col px-4 pt-4 pb-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="Ball Type" required>
          {enumsError ? (
            <ErrorState
              title="Couldn’t Load Ball Types"
              description="Formats come from the server."
              onRetry={() => void refetchEnums()}
            />
          ) : enumsLoading && ballTypes.length === 0 ? (
            <Skeleton className="h-10 w-full rounded-panel" aria-label="Loading Ball Types" />
          ) : (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Ball Type">
              {ballTypes.map((item) => (
                <QuickMatchChoiceChip
                  key={item.value}
                  selected={resolvedBall === item.value}
                  disabled={enumsLoading}
                  onClick={() => setBall(item.value)}
                >
                  {item.label}
                </QuickMatchChoiceChip>
              ))}
            </div>
          )}
        </Field>

        <Field label="Overs" required>
          <NumberStepper
            value={overs}
            min={QUICK_MATCH_OVERS_MIN}
            max={QUICK_MATCH_OVERS_MAX}
            onChange={setOvers}
            decreaseLabel="Decrease Overs"
            increaseLabel="Increase Overs"
          />
        </Field>

        <Field label="Players Per Side" required hint="Both rosters resize to match">
          <NumberStepper
            value={players}
            min={QUICK_MATCH_PLAYERS_MIN}
            max={QUICK_MATCH_PLAYERS_MAX}
            onChange={setSideSize}
            decreaseLabel="Decrease Players"
            increaseLabel="Increase Players"
          />
        </Field>

        <div className="bg-border-subtle h-px" />

        <QuickMatchVersusCard
          overs={overs}
          ballLabel={ballLabel}
          players={players}
          homeName={homeName}
          awayName={awayName}
          homeCount={homePlayers.length}
          awayCount={awayPlayers.length}
        />

        <QuickMatchRoster
          letter="A"
          name={homeName}
          onRename={setHomeName}
          players={homePlayers}
          target={players}
          onFind={() => setAdding({ side: 'home', mode: 'find' })}
          onWalkUp={() => setAdding({ side: 'home', mode: 'new' })}
          onRemove={(index) => setHomePlayers((list) => list.filter((_, i) => i !== index))}
        />
        <QuickMatchRoster
          letter="B"
          name={awayName}
          onRename={setAwayName}
          players={awayPlayers}
          target={players}
          onFind={() => setAdding({ side: 'away', mode: 'find' })}
          onWalkUp={() => setAdding({ side: 'away', mode: 'new' })}
          onRemove={(index) => setAwayPlayers((list) => list.filter((_, i) => i !== index))}
        />
      </Form>

      <StickyActionBar>
        <p
          className={cn(
            'mb-2.5 flex items-center gap-2 text-2xs leading-snug',
            status.alert ? 'text-danger' : 'text-muted'
          )}
          role={status.alert ? 'alert' : 'status'}
        >
          <span
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.alert ? 'bg-danger' : 'bg-positive')}
            aria-hidden
          />
          {status.text}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="shrink-0 px-4 font-bold"
            disabled={!gate.canSave}
            loading={isLoading}
            onClick={() => void start('save')}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            className="flex-1 font-bold"
            disabled={!gate.canToss}
            loading={isLoading}
            onClick={() => void start('toss')}
          >
            Toss & Start Match
          </Button>
        </div>
      </StickyActionBar>

      <AddQuickMatchPlayerSheet
        key={adding ? `${adding.side}-${adding.mode}` : 'closed'}
        open={adding != null}
        initialMode={adding?.mode ?? 'find'}
        sideLabel={adding?.side === 'away' ? awayName.trim() || 'Side B' : homeName.trim() || 'Side A'}
        takenIds={takenIds}
        onOpenChange={(open) => {
          if (!open) setAdding(null);
        }}
        onAdd={(player) => {
          if (adding) addPlayer(adding.side, player);
        }}
      />
    </>
  );
}
