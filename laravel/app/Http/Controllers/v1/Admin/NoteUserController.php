<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\Note\NoteUserResource;
use App\Models\NoteUser;

class NoteUserController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(NoteUser::class, NoteUserResource::class, 'note_user');
    }

    protected function baseQuery()
    {
        return $this->model->with('creator', 'editor', 'note', 'user', 'user.bank_account')->filterByAgentRole();
    }

    public function show(NoteUser $noteUser)
    {
        return $this->_show($noteUser);
    }

    public function destroy(NoteUser $noteUser)
    {
        return $this->_destroy($noteUser);
    }
}
