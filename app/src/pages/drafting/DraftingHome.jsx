import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/ui/Button';

export default function DraftingHome() {
  const { openDialog } = useDialog();

  return (
    <div className="flex min-h-[calc(100vh-144px)] flex-col bg-black">
      <AppSubpageHeader title="Drafting" />

      <div className="flex flex-1 items-center justify-center">
        <Button type="button" variant="card" size="card" onClick={() => openDialog('manageTeam', { mode: 'create' })}>
          <span className="bg-brand text-ink flex h-[44px] w-[44px] items-center justify-center rounded-full text-[32px] font-bold">
            +
          </span>
          <span className="text-muted text-[16px] font-bold">Create Teams</span>
        </Button>
      </div>
    </div>
  );
}
