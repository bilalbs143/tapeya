<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreMatchNoteRequest;
use App\Models\MatchNote;
use App\Models\MatchScoringAudit;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchNoteController extends Controller
{
    use BaseControllerTrait;

    public function index(Request $request, TournamentMatch $match): JsonResponse
    {
        if (! $request->user()?->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot view notes for this match.');
        }

        $sort = strtolower((string) $request->query('sort', 'desc'));
        $direction = $sort === 'asc' ? 'asc' : 'desc';
        $search = trim((string) $request->query('q', ''));

        $notes = MatchNote::query()
            ->with('author:id,name')
            ->where('match_id', $match->id)
            ->when($search !== '', fn ($query) => $query->where('body', 'like', '%'.$search.'%'))
            ->orderBy('created_at', $direction)
            ->limit(500)
            ->get()
            ->map(fn (MatchNote $note) => $this->formatNote($note));

        return $this->success(['notes' => $notes]);
    }

    public function store(StoreMatchNoteRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot add notes for this match.');
        }

        $note = MatchNote::query()->create([
            'match_id' => $match->id,
            'user_id' => $authUser->id,
            'body' => trim($request->validated('body')),
        ]);

        $note->load('author:id,name');

        MatchScoringAudit::query()->create([
            'tournament_match_id' => $match->id,
            'user_id' => $authUser->id,
            'action' => 'create_match_note',
            'ball_id' => null,
            'meta' => [
                'note_id' => $note->id,
            ],
        ]);

        return $this->success(
            ['note' => $this->formatNote($note)],
            'Note added.',
        );
    }

    public function destroy(Request $request, TournamentMatch $match, MatchNote $note): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot delete notes for this match.');
        }

        if ((int) $note->match_id !== (int) $match->id) {
            return $this->notFound('Note not found for this match.');
        }

        $noteId = $note->id;

        $note->delete();

        MatchScoringAudit::query()->create([
            'tournament_match_id' => $match->id,
            'user_id' => $authUser->id,
            'action' => 'delete_match_note',
            'ball_id' => null,
            'meta' => [
                'note_id' => $noteId,
            ],
        ]);

        return $this->success(null, 'Note deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatNote(MatchNote $note): array
    {
        return [
            'id' => $note->id,
            'match_id' => $note->match_id,
            'user_id' => $note->user_id,
            'author_name' => $note->author?->name,
            'body' => $note->body,
            'created_at' => $note->created_at?->toIso8601String(),
            'updated_at' => $note->updated_at?->toIso8601String(),
        ];
    }
}
