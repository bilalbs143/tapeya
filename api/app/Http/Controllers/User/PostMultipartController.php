<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Services\Post\PostInteractionService;
use App\Services\Post\PostMultipartUploadService;
use App\Support\PhpUploadError;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostMultipartController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostMultipartUploadService $multipart,
        private readonly PostInteractionService $interactions,
    ) {}

    public function initiate(Request $request, Post $post): JsonResponse
    {
        if ($response = $this->guardOwner($request, $post)) {
            return $response;
        }

        return $this->success($this->multipart->initiate($post), 'Multipart upload initiated.');
    }

    public function part(Request $request, Post $post): JsonResponse
    {
        if ($response = $this->guardOwner($request, $post)) {
            return $response;
        }

        if ($message = PhpUploadError::message($request->file('file'))) {
            return $this->failure($message, 'VALIDATION_ERROR', ['file' => [$message]]);
        }

        $validated = $request->validate([
            'upload_id' => ['required', 'uuid'],
            'part_number' => ['required', 'integer', 'min:1'],
            'file' => ['required', 'file'],
        ]);

        $result = $this->multipart->storePart(
            $post,
            $validated['upload_id'],
            (int) $validated['part_number'],
            $request->file('file'),
        );

        return $this->success($result, 'Part stored.');
    }

    public function complete(Request $request, Post $post): JsonResponse
    {
        if ($response = $this->guardOwner($request, $post)) {
            return $response;
        }

        $validated = $request->validate([
            'upload_id' => ['required', 'uuid'],
            'total_parts' => ['required', 'integer', 'min:1'],
            'filename' => ['nullable', 'string', 'max:255'],
            'content_type' => ['nullable', 'string', 'max:100'],
        ]);

        $post = $this->multipart->complete(
            $post,
            $validated['upload_id'],
            (int) $validated['total_parts'],
            $validated['filename'] ?? null,
            $validated['content_type'] ?? null,
        );

        $post->load([User::socialSummaryWith(), 'hashtags:id,name']);
        $this->interactions->attachViewerState($post, $request->user());

        return $this->success(new PostResource($post), 'Upload completed.');
    }

    public function abort(Request $request, Post $post): JsonResponse
    {
        if ($response = $this->guardOwner($request, $post)) {
            return $response;
        }

        $validated = $request->validate([
            'upload_id' => ['required', 'uuid'],
        ]);

        $this->multipart->abort($post, $validated['upload_id']);

        return $this->success(null, 'Upload aborted.');
    }

    private function guardOwner(Request $request, Post $post): ?JsonResponse
    {
        if ($post->user_id !== $request->user()->id) {
            return $this->forbidden('You cannot upload to this reel.');
        }

        return null;
    }
}
