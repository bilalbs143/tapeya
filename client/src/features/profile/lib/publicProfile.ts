export type PublicProfileTab = 'reels' | 'posts' | 'stats';

export const PUBLIC_PROFILE_TABS: { value: PublicProfileTab; label: string }[] = [
  { value: 'reels', label: 'Reels' },
  { value: 'posts', label: 'Posts' },
  { value: 'stats', label: 'Stats' },
];

export function publicProfileShareTitle(name: string | null | undefined, handle: string): string {
  return `${name ?? handle} (@${handle}) on Tapeya`;
}
