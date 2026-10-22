import { useMemo, useState } from 'react';

import { useGetEnumsQuery } from '@/shared/api/enumsApi';
import { getApiErrorMessage } from '@/shared/api/errors';
import { enumOptions } from '@/shared/model/enums';
import { toast } from '@/shared/ui/toast';

import {
  useCreateMatchNoteMutation,
  useDeleteMatchNoteMutation,
  useGetMatchNotesQuery,
  useGetMatchTeamSquadQuery,
  useStoreAdditionalRunsMutation,
  useStoreMatchBreakMutation,
  useStoreMatchSubstituteMutation,
  useUpdateMatchWicketKeeperMutation,
} from '../api/matchesApi';
import { ADMIN_ACTION_TITLES, adminPrimaryLabel } from '../lib/adminActionSheetMeta';
import type { AdminPlayer, AdminSheetAction } from '../lib/adminActionSheetTypes';

export type UseAdminActionSheetArgs = {
  action: AdminSheetAction | null;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  inningsId: number | null;
  bowlingTeamId: number | null;
  batsmenOnCrease: AdminPlayer[];
};

/** Form state + mutations for AdminActionSheet panels. */
export function useAdminActionSheet({
  action,
  onOpenChange,
  matchId,
  inningsId,
  bowlingTeamId,
  batsmenOnCrease,
}: UseAdminActionSheetArgs) {
  const open = action != null;
  const meta = action ? ADMIN_ACTION_TITLES[action] : null;

  const {
    data: enums,
    isLoading: enumsLoading,
    isError: enumsError,
    refetch: refetchEnums,
  } = useGetEnumsQuery(undefined, { skip: !open || action !== 'add_break' });
  const breakOptions = enumOptions(enums, 'match_break_type');

  const squadQuery = useGetMatchTeamSquadQuery(
    { matchId, teamId: bowlingTeamId ?? 0 },
    { skip: !open || action !== 'change_keeper' || bowlingTeamId == null }
  );

  const notesQuery = useGetMatchNotesQuery({ matchId, sort: 'desc' }, { skip: !open || action !== 'match_notes' });

  const [updateKeeper, keeperState] = useUpdateMatchWicketKeeperMutation();
  const [storeSub, subState] = useStoreMatchSubstituteMutation();
  const [storeRuns, runsState] = useStoreAdditionalRunsMutation();
  const [storeBreak, breakState] = useStoreMatchBreakMutation();
  const [createNote, createNoteState] = useCreateMatchNoteMutation();
  const [deleteNote, deleteNoteState] = useDeleteMatchNoteMutation();

  const [selectedKeeper, setSelectedKeeper] = useState<number | null>(null);
  const [offId, setOffId] = useState<number | null>(null);
  const [onId, setOnId] = useState<number | null>(null);
  const [fielderId, setFielderId] = useState<number | null>(null);
  const [runs, setRuns] = useState(2);
  const [breakType, setBreakType] = useState('');
  const [breakNotes, setBreakNotes] = useState('');
  const [noteText, setNoteText] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  const keeperId = squadQuery.data?.wicketKeeperId ?? null;

  // Reseat on open or action switch — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevAction, setPrevAction] = useState(action);
  if (open !== prevOpen || action !== prevAction) {
    setPrevOpen(open);
    setPrevAction(action);
    if (open && action) {
      setSelectedKeeper(keeperId);
      setOffId(null);
      setOnId(null);
      setFielderId(null);
      setRuns(action === 'additional_runs' ? 2 : 1);
      setBreakType(action === 'add_break' ? (breakOptions[0]?.value ?? '') : '');
      setBreakNotes('');
      setNoteText('');
      setDeletingNoteId(null);
    }
  }

  // The keeper squad query can still be loading when the sheet opens — once
  // it settles (or changes), adopt the server's current keeper.
  const [prevKeeperId, setPrevKeeperId] = useState(keeperId);
  if (keeperId !== prevKeeperId) {
    setPrevKeeperId(keeperId);
    if (action === 'change_keeper' && open && keeperId != null) {
      setSelectedKeeper(keeperId);
    }
  }

  const saving =
    keeperState.isLoading ||
    subState.isLoading ||
    runsState.isLoading ||
    breakState.isLoading ||
    createNoteState.isLoading;

  const primaryDisabled = useMemo(() => {
    if (!action || saving) return true;
    if (action === 'change_keeper') return selectedKeeper == null || bowlingTeamId == null;
    if (action === 'substitute') {
      return offId == null || onId == null || inningsId == null || batsmenOnCrease.length === 0;
    }
    if (action === 'additional_runs') return runs < 1 || inningsId == null;
    if (action === 'add_break') return !breakType;
    if (action === 'match_notes') return !noteText.trim();
    return false;
  }, [
    action,
    saving,
    selectedKeeper,
    bowlingTeamId,
    offId,
    onId,
    inningsId,
    batsmenOnCrease.length,
    runs,
    breakType,
    noteText,
  ]);

  async function commit() {
    if (!action) return;
    try {
      if (action === 'change_keeper') {
        if (selectedKeeper == null || bowlingTeamId == null) return;
        await updateKeeper({
          matchId,
          teamId: bowlingTeamId,
          wicketKeeperId: selectedKeeper,
        }).unwrap();
        toast({ title: 'Wicket Keeper Updated', tone: 'success' });
      } else if (action === 'substitute') {
        if (offId == null || onId == null || inningsId == null) return;
        await storeSub({
          matchId,
          inningsId,
          replacedPlayerId: offId,
          substitutePlayerId: onId,
          fielderId,
        }).unwrap();
        toast({ title: 'Substitute Recorded', tone: 'success' });
      } else if (action === 'additional_runs') {
        if (inningsId == null || runs < 1) return;
        await storeRuns({ matchId, inningsId, runs }).unwrap();
        toast({ title: 'Additional Runs Added', tone: 'success' });
      } else if (action === 'add_break') {
        if (!breakType) return;
        await storeBreak({
          matchId,
          breakType,
          notes: breakNotes.trim() || null,
          inningsId,
        }).unwrap();
        toast({ title: 'Break Recorded', tone: 'success' });
      } else if (action === 'match_notes') {
        const body = noteText.trim();
        if (!body) return;
        await createNote({ matchId, body }).unwrap();
        toast({ title: 'Note Added', tone: 'success' });
        setNoteText('');
        return;
      } else if (action === 'match_rules') {
        onOpenChange(false);
        return;
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not save — try again.'),
        tone: 'error',
      });
    }
  }

  async function handleDeleteNote(noteId: number) {
    if (deletingNoteId != null) return;
    setDeletingNoteId(noteId);
    try {
      await deleteNote({ matchId, noteId }).unwrap();
      toast({ title: 'Note Deleted', tone: 'success' });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not delete note.'),
        tone: 'error',
      });
    } finally {
      setDeletingNoteId(null);
    }
  }

  return {
    open,
    meta,
    breakOptions,
    enumsLoading,
    enumsError,
    refetchEnums,
    squadQuery,
    notesQuery,
    selectedKeeper,
    setSelectedKeeper,
    offId,
    setOffId,
    onId,
    setOnId,
    fielderId,
    setFielderId,
    runs,
    setRuns,
    breakType,
    setBreakType,
    breakNotes,
    setBreakNotes,
    noteText,
    setNoteText,
    deletingNoteId,
    deleteNoteLoading: deleteNoteState.isLoading,
    saving,
    primaryDisabled,
    primaryLabel: action ? adminPrimaryLabel(action) : 'Close',
    commit,
    handleDeleteNote,
  };
}
