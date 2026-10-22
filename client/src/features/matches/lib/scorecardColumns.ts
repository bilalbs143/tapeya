import type { DenseTableColumn } from '@/shared/ui/DenseTable';

export const BATTING_COLUMNS: DenseTableColumn[] = [
  { key: 'batter', label: 'Batter', width: 'minmax(0,1fr)' },
  { key: 'runs', label: 'R', width: '38px', align: 'right', mono: true, emphasis: 'primary' },
  { key: 'balls', label: 'B', width: '32px', align: 'right', mono: true },
  { key: 'fours', label: '4s', width: '28px', align: 'right', mono: true },
  { key: 'sixes', label: '6s', width: '28px', align: 'right', mono: true },
  { key: 'sr', label: 'SR', width: '46px', align: 'right', mono: true },
];

export const BOWLING_COLUMNS: DenseTableColumn[] = [
  { key: 'bowler', label: 'Bowler', width: 'minmax(0,1fr)' },
  { key: 'overs', label: 'O', width: '38px', align: 'right', mono: true },
  { key: 'maidens', label: 'M', width: '28px', align: 'right', mono: true },
  { key: 'runs', label: 'R', width: '32px', align: 'right', mono: true },
  { key: 'wickets', label: 'W', width: '28px', align: 'right', mono: true, emphasis: 'primary' },
  { key: 'econ', label: 'Econ', width: '46px', align: 'right', mono: true },
];
