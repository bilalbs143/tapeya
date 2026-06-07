import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/ui/Button';

export default function DraftingHome() {
  const { openDialog } = useDialog();

  return (
    <div className="flex min-h-[calc(100vh-144px)] flex-col bg-black">
      <AppSubpageHeader title="Drafting" />

      <div className="flex flex-1 items-center justify-center">
        <Button
          type="button"
          variant="card"
          onClick={() => openDialog('manageTeam', { mode: 'create' })}
          className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-surface px-0 py-0"
        >
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand text-[32px] font-bold text-ink">
            +
          </span>
          <span className="text-[16px] font-bold text-muted">Create Teams</span>
        </Button>
      </div>
    </div>
  );
}
