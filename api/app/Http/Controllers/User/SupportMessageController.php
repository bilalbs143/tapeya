<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreSupportMessageRequest;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;

class SupportMessageController extends Controller
{
    use BaseControllerTrait;

    /** Store a contact / support message from an authenticated app user. */
    public function store(StoreSupportMessageRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = SupportMessage::create([
            'user_id' => $request->user()?->id,
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'message' => $data['message'],
        ]);

        return $this->success(
            ['id' => $record->id],
            'Your message has been sent. We will get back to you soon.',
            'CREATED'
        );
    }
}
