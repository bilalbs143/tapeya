export type StatusKind = 'match' | 'order' | 'vendor' | 'tournament' | 'stream';

type StatusTone = 'neutral' | 'brand' | 'positive' | 'danger' | 'warning' | 'live';

export type StatusMeta = {
  tone: StatusTone;
  label: string;
};

const MATCH: Record<string, StatusMeta> = {
  live: { tone: 'live', label: 'Live' },
  in_progress: { tone: 'live', label: 'Live' },
  break: { tone: 'warning', label: 'Break' },
  no_toss: { tone: 'neutral', label: 'Toss Pending' },
  toss_done: { tone: 'brand', label: 'Toss Done' },
  scheduled: { tone: 'neutral', label: 'Scheduled' },
  completed: { tone: 'positive', label: 'Result' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
  draft: { tone: 'neutral', label: 'Draft' },
  upcoming: { tone: 'neutral', label: 'Upcoming' },
  result: { tone: 'positive', label: 'Result' },
};

const ORDER: Record<string, StatusMeta> = {
  pending: { tone: 'brand', label: 'Pending' },
  processing: { tone: 'brand', label: 'Processing' },
  dispatched: { tone: 'brand', label: 'Dispatched' },
  delivered: { tone: 'positive', label: 'Delivered' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
};

const VENDOR: Record<string, StatusMeta> = {
  none: { tone: 'neutral', label: 'No Store' },
  pending: { tone: 'brand', label: 'Pending Approval' },
  approved: { tone: 'positive', label: 'Approved' },
  suspended: { tone: 'danger', label: 'Suspended' },
  rejected: { tone: 'danger', label: 'Not Approved' },
};

const TOURNAMENT: Record<string, StatusMeta> = {
  setup: { tone: 'neutral', label: 'Setup' },
  active: { tone: 'brand', label: 'Active' },
  upcoming: { tone: 'neutral', label: 'Upcoming' },
  review: { tone: 'brand', label: 'In Review' },
  rejected: { tone: 'danger', label: 'Not Approved' },
  previous: { tone: 'neutral', label: 'Finished' },
  inactive: { tone: 'neutral', label: 'Finished' },
};

const STREAM: Record<string, StatusMeta> = {
  live: { tone: 'live', label: 'Live' },
  starting: { tone: 'brand', label: 'Starting' },
  idle: { tone: 'neutral', label: 'Idle' },
  ended: { tone: 'neutral', label: 'Ended' },
  error: { tone: 'danger', label: 'Error' },
};

const MAPS: Record<StatusKind, Record<string, StatusMeta>> = {
  match: MATCH,
  order: ORDER,
  vendor: VENDOR,
  tournament: TOURNAMENT,
  stream: STREAM,
};

export function statusMeta(kind: StatusKind, status: string | null | undefined): StatusMeta {
  const meta = status == null ? undefined : MAPS[kind][status];
  return meta ?? { tone: 'neutral', label: String(status ?? '—') };
}
