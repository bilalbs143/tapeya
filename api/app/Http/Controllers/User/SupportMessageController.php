<?php

namespace App\Http\Controllers\User;

use App\Events\SupportMessageSubmitted;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreSupportMessageRequest;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;

class SupportMessageController extends Controller
{
    use BaseControllerTrait;

    private const ATTACHMENT_STORAGE_PATH = 'support-messages/attachments';

    /** Store a contact / support message from an authenticated app user. */
    public function store(StoreSupportMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $fileData = [];
        $this->storeImage($request, 'attachment', self::ATTACHMENT_STORAGE_PATH, $fileData);

        $record = SupportMessage::create([
            'user_id' => $request->user()?->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'],
            'attachment_path' => $fileData['attachment'] ?? null,
        ]);

        event(new SupportMessageSubmitted($record));

        return $this->success(
            ['id' => $record->id],
            'Your message has been sent. We will get back to you soon.',
            'CREATED'
        );
    }
}
