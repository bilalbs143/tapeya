import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

import { clearReelUploadSession, useReelUploadSession } from '../lib/reelUploadSession';
import { reelRoutes } from '../routes';

function uploadCopy(status: string, stage: string) {
  if (status === 'error') {
    return { title: 'Upload Failed', detail: 'Your video is still here — nothing lost.' };
  }
  if (status === 'success') {
    return { title: 'Reel Posted', detail: 'Opening your reel…' };
  }
  if (stage === 'preparing') {
    return { title: 'Preparing', detail: 'Getting things ready…' };
  }
  if (stage === 'finishing') {
    return { title: 'Finishing', detail: 'Almost there — keep the app open.' };
  }
  return { title: 'Uploading', detail: 'Keep the app open. One reel uploads at a time.' };
}

function stageOf(pct: number) {
  if (pct < 15) return 'preparing';
  if (pct < 88) return 'uploading';
  return 'finishing';
}

/** Blocking multipart reel upload progress. */
export function ReelUploadProgressDialog() {
  const navigate = useNavigate();
  const session = useReelUploadSession();
  const open = session.status !== 'idle';
  const isUploading = session.status === 'uploading';
  const isError = session.status === 'error';
  const isSuccess = session.status === 'success';
  const pct = Math.min(100, Math.max(0, Math.round(session.percent)));
  const copy = uploadCopy(session.status, session.stage);
  const stage = stageOf(pct);

  useEffect(() => {
    if (session.status !== 'success' || !session.reelId) return;
    navigate(reelRoutes.detail(session.reelId), { replace: true });
  }, [navigate, session.reelId, session.status]);

  function handleOpenChange(next: boolean) {
    if (next || isUploading) return;
    clearReelUploadSession();
  }

  return (
    <BaseDialog open={open} onOpenChange={handleOpenChange} sheet showClose={isError} contentClassName="p-0">
      {isError ? (
        <>
          <DialogHeader className="pr-5">
            <div className="flex items-center gap-2.5">
              <span className="bg-danger/18 text-danger grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-2xs font-extrabold">
                !
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle>{copy.title}</DialogTitle>
                <DialogDescription>{session.error ?? copy.detail}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" size="md" onClick={() => clearReelUploadSession()}>
              Dismiss
            </Button>
          </DialogFooter>
        </>
      ) : isSuccess ? (
        <DialogHeader className="pr-5">
          <div className="flex items-center gap-2.5">
            <span className="bg-positive/18 text-positive-2 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-xs font-extrabold">
              ✓
            </span>
            <div>
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.detail}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
      ) : (
        <>
          <DialogHeader className="pr-5">
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription className="sr-only">{copy.detail}</DialogDescription>
          </DialogHeader>
          <DialogBody className="gap-3.5">
            <div>
              <div className="bg-page-deep h-2 overflow-hidden rounded-full">
                <div
                  className="bg-brand h-full rounded-full transition-[width] duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-dim mt-2 flex font-mono text-3xs font-semibold tabular-nums">
                <span className="flex-1">{pct}%</span>
              </div>
            </div>
            <ol className="flex flex-col gap-2">
              <StageRow done={pct >= 15} active={stage === 'preparing'} label="Preparing" />
              <StageRow done={pct >= 88} active={stage === 'uploading'} label="Uploading" />
              <StageRow done={pct >= 100} active={stage === 'finishing'} label="Finishing" />
            </ol>
            <p className="border-border-subtle text-muted rounded-icon border px-2.5 py-2 text-3xs leading-snug">
              {copy.detail}
            </p>
          </DialogBody>
        </>
      )}
    </BaseDialog>
  );
}

function StageRow({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          'grid h-4 w-4 shrink-0 place-items-center rounded-full text-4xs font-extrabold',
          done
            ? 'bg-positive/20 text-positive-2'
            : active
              ? 'border-brand border-2'
              : 'border-border-subtle border-[1.5px]'
        )}
      >
        {done ? '✓' : null}
      </span>
      <span
        className={cn(
          'text-2xs',
          done ? 'font-semibold text-muted' : active ? 'font-bold text-ink' : 'font-semibold text-dim'
        )}
      >
        {label}
      </span>
    </li>
  );
}
