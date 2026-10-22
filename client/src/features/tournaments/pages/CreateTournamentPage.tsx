import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';

import { CREATE_TOURNAMENT_STEPS } from '../lib/createTournamentSteps';
import { tournamentRoutes } from '../tournamentPaths';
import { CreateTournamentWizard } from '../ui/CreateTournamentWizard';

/** Create a tournament — Type D wizard: single ScreenBar + step progress in `below`. */

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const stepMeta = CREATE_TOURNAMENT_STEPS[step] ?? CREATE_TOURNAMENT_STEPS[0];
  const subtitle = `Step ${step + 1} of ${CREATE_TOURNAMENT_STEPS.length} · ${stepMeta.label}`;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar
        title="Create Tournament"
        subtitle={subtitle}
        onBack={() => navigate(tournamentRoutes.list())}
        below={
          <div className="flex gap-1.5 px-4 pt-1 pb-3">
            {CREATE_TOURNAMENT_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-brand' : 'bg-surface-raised')}
              />
            ))}
          </div>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <CreateTournamentWizard
          step={step}
          onStepChange={setStep}
          onCreated={(id) => navigate(tournamentRoutes.detail(id), { replace: true })}
        />
      </div>
    </div>
  );
}
