import type { AdSurface } from '../model/schemas';

type MetricKind = 'impression' | 'view' | 'click';

const tracked = new Set<string>();

function key(surface: AdSurface, creativeId: number, kind: MetricKind): string {
  return `${kind}:${surface}:${creativeId}`;
}

export function hasTrackedAdMetric(surface: AdSurface, creativeId: number, kind: MetricKind): boolean {
  return tracked.has(key(surface, creativeId, kind));
}

export function markAdMetric(surface: AdSurface, creativeId: number, kind: MetricKind): void {
  tracked.add(key(surface, creativeId, kind));
}

export function resetAdMetricsSessionForTests(): void {
  tracked.clear();
}
