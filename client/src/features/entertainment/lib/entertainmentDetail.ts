export function parseEntertainmentSerialId(raw: string | undefined): number | null {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function entertainmentEpisodeViewsLabel(viewsCount: number): string {
  return `${viewsCount} views`;
}

export function entertainmentEpisodeBadge(episodeNumber: number): string {
  return `EP ${episodeNumber}`;
}
