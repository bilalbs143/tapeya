import type { ReelTab } from '../model/schemas';

export function reelsEmptyCopy(tab: ReelTab): { title: string; description: string } {
  switch (tab) {
    case 'following':
      return { title: 'No Reels from People You Follow', description: 'Follow players to fill this tab.' };
    case 'mine':
      return { title: 'You Haven’t Posted a Reel Yet', description: 'Upload from the + button above.' };
    case 'saved':
      return { title: 'No Saved Reels', description: 'Bookmark a reel to find it here later.' };
    default:
      return { title: 'No Reels Yet', description: 'Be the first to upload a clip.' };
  }
}
