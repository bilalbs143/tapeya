export type AdminSheetAction =
  'change_keeper' | 'substitute' | 'additional_runs' | 'add_break' | 'match_notes' | 'match_rules';

export type AdminPlayer = {
  id: number;
  name: string;
  role?: string | null | undefined;
};
