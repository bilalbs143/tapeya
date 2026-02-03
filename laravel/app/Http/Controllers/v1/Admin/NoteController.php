<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Note\NoteCategoryEnum;
use App\Events\Admin\Note\NoteCreated;
use App\Http\Requests\v1\Admin\Note\CreateNoteRequest;
use App\Http\Resources\v1\Note\NoteResource;
use App\Models\Note;
use App\Models\User;

class NoteController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Note::class, NoteResource::class, 'note');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function getCategories()
    {
        return response()->json([
            'data' => NoteCategoryEnum::withLabels(),
        ]);
    }

    public function store(CreateNoteRequest $request)
    {
        return $this->_store($request, dataMapper: function (&$data) {
            if (! isset($data['user_id'])) {
                return $data;
            }

            // TODO: have to confirm do we need this code snippet in case of provider user or not
            // $user = User::findOrFail($data['user_id']);
            // $data['agent_id'] = $user->parent_id;
        }, callback: function (Note $record) use ($request) {
            if ($request->has('user_id')) {
                $record->users()->create(['user_id' => $request->user_id]);

                NoteCreated::dispatch($record);

                return;
            }
            $agent = $record->agent->load('grand_children', 'members');
            $memberIds = collect($agent->allMemberIds())->map(fn ($item) => ['user_id' => $item]);

            $record->users()->createMany($memberIds);

            NoteCreated::dispatch($record);
        });
    }

    public function show(Note $note)
    {
        return $this->_show($note);
    }

    public function destroy(Note $note)
    {
        return $this->_destroy($note, callback: function (Note $record) {
            $record->users()->delete();
        });
    }
}
