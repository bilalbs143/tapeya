import { IconButton } from '@/shared/ui/IconButton';
import { ShareIcon } from '@/shared/ui/icons';

/** Share control for ScreenBar `action` on the public match page. */

export function FanShareButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      label="Share"
      variant="outline"
      round={false}
      size="sm"
      onClick={onClick}
      className="h-8 w-8 rounded-icon"
    >
      <ShareIcon className="text-muted h-3.5 w-3.5" strokeWidth={1.9} />
    </IconButton>
  );
}
