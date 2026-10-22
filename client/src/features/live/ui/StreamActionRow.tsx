import { HeartIcon, RotateIcon, ShareIcon } from '@/shared/ui/icons';
import { type MediaActionItem, MediaActionRow } from '@/shared/ui/MediaActionRow';

type StreamActionRowProps = {
  onShare: () => void;
  onHeart: () => void;
  /** Portrait rotate — omit for self-serve camera streams that stay upright. */
  onRotate?: (() => void) | undefined;
  className?: string | undefined;
};

/** Compact Share / Full / Heart — under the stream title, above the comment sheet. */
export function StreamActionRow({ onShare, onHeart, onRotate, className }: StreamActionRowProps) {
  const actions: MediaActionItem[] = [
    {
      key: 'share',
      label: 'Share',
      ariaLabel: 'Share',
      onClick: onShare,
      icon: <ShareIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />,
    },
  ];

  if (onRotate) {
    actions.push({
      key: 'full',
      label: 'Full',
      ariaLabel: 'Rotate to Landscape',
      onClick: onRotate,
      icon: <RotateIcon className="h-3.5 w-3.5 shrink-0" />,
      className: 'tab:hidden',
    });
  }

  actions.push({
    key: 'heart',
    label: 'Heart',
    ariaLabel: 'Send Heart',
    onClick: onHeart,
    icon: <HeartIcon className="text-like h-3.5 w-3.5 shrink-0" strokeWidth={2} filled />,
  });

  return <MediaActionRow className={className} actions={actions} />;
}
