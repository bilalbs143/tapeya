import { useState } from 'react';

import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDate } from '@/lib/utils/dateUtils';
import { useGetMatchNotesQuery } from '@/store/api/matchApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { LoaderBlock } from '@/ui/Loader';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Textarea } from '@/ui/Textarea';

const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

function NoteCard({ note, onDelete, isDeleting }) {
  return (
    <article className="border-border-subtle bg-surface rounded-[10px] border px-4 py-3">
      <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-white">{note.body}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-muted text-[11px]">
          {[note.author_name, note.created_at ? formatDate(note.created_at) : null].filter(Boolean).join(' · ')}
        </p>
        <button
          type="button"
          onClick={() => onDelete(note.id)}
          disabled={isDeleting}
          aria-label="Delete Note"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-opacity active:opacity-80 disabled:opacity-50"
        >
          <img src={teamDeleteIcon} alt="" className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

function AddNoteForm({ body, onBodyChange }) {
  return (
    <FormStack density="compact">
      <FormField label="Note" htmlFor="match-note-body">
        <Textarea
          id="match-note-body"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Write Here..."
          rows={6}
        />
      </FormField>
    </FormStack>
  );
}

/**
 * Action menu → Match Notes.
 *
 * @param {string} matchId
 */
export function MatchNotesDialog({ matchId }) {
  const toast = useToast();

  const [view, setView] = useState('list');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const trimmedSearch = searchQuery.trim();

  const { data, isLoading, isFetching } = useGetMatchNotesQuery({
    matchId,
    sort: sortOrder,
    q: trimmedSearch || undefined,
  });

  const { createNote, isCreatingNote: isCreating, deleteNote } = useMatchAdmin({ matchId });

  const notes = data?.notes ?? [];

  const emptyMessage = trimmedSearch ? 'No notes match your filter.' : null;

  const canSubmitNote = draftBody.trim().length > 0 && !isCreating;

  const handleCreate = async () => {
    if (!canSubmitNote) return;
    try {
      await createNote({ body: draftBody.trim() });
      toast.success('Note added.');
      setDraftBody('');
      setView('list');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add note. Please try again.'));
    }
  };

  const handleDelete = async (noteId) => {
    if (deletingId != null) return;
    setDeletingId(noteId);
    try {
      await deleteNote({ noteId });
      toast.success('Note deleted.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete note. Please try again.'));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <>
      <DialogHeaderRow
        trailing={
          view === 'list' ? (
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter and Sort Notes"
                  className={`focus-visible:ring-brand inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 ${
                    filterOpen || trimmedSearch ? 'text-brand' : 'text-muted hover:text-white'
                  }`}
                >
                  <FilterIcon />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="!border-border-subtle !bg-surface-raised z-[100] w-56 !rounded-[10px] p-3 shadow-lg"
                align="end"
                sideOffset={8}
              >
                <FormStack density="compact">
                  <FormField label="Search" htmlFor="match-notes-filter">
                    <Input
                      id="match-notes-filter"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter Notes…"
                    />
                  </FormField>
                  <button
                    type="button"
                    onClick={toggleSort}
                    className="border-border-subtle bg-surface w-full rounded-[6px] border px-3 py-2 text-left text-[13px] text-white hover:bg-[#282824]"
                  >
                    Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </button>
                </FormStack>
              </PopoverContent>
            </Popover>
          ) : null
        }
      >
        {view === 'add' ? <DialogBackButton onClick={() => setView('list')} ariaLabel="Back to Notes" /> : null}
        <DialogTitle className={dialogPrimaryTitleClass}>Notes</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          {view === 'add' ? (
            <AddNoteForm body={draftBody} onBodyChange={setDraftBody} />
          ) : isLoading ? (
            <LoaderBlock label="Loading notes" className="py-8" />
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[14px] font-medium text-white">{emptyMessage ?? "You don't have any Notes added yet."}</p>
              {!emptyMessage ? (
                <p className="text-muted max-w-[260px] text-[13px] leading-relaxed">
                  Please click on the below button to Add Notes for matches.
                </p>
              ) : null}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note.id}>
                  <NoteCard note={note} onDelete={handleDelete} isDeleting={deletingId === note.id} />
                </li>
              ))}
            </ul>
          )}
          {isFetching && !isLoading ? <LoaderBlock label="Updating notes" className="py-1" /> : null}
        </FormStack>
      </DialogScrollBody>

      {view === 'add' ? (
        <DialogSaveButton disabled={!canSubmitNote} loading={isCreating} onClick={handleCreate}>
          {isCreating ? 'Saving…' : 'Add Note'}
        </DialogSaveButton>
      ) : (
        <DialogSaveButton
          onClick={() => {
            setDraftBody('');
            setView('add');
          }}
        >
          + Add Note
        </DialogSaveButton>
      )}
    </>
  );
}

export default MatchNotesDialog;
