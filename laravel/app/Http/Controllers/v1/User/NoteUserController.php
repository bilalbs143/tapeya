<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Note\NoteUserResource;
use App\Models\NoteUser;

class NoteUserController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(NoteUser::class, NoteUserResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->where('user_id', auth()->id())->with('note', 'user', 'user.bank_account', 'reader');
    }

    public function show(NoteUser $noteUser)
    {
        $noteUser->read();

        return $this->_show($noteUser);
    }
}
