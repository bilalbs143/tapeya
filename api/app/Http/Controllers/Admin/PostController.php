<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\Post\UpdatePostRequest;
use App\Http\Resources\Admin\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Services\Post\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PostController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Post::class, PostResource::class, 'post');
    }

    protected function baseQuery()
    {
        return Post::query()->with([
            User::socialSummaryWith(),
            'video',
            'media',
        ]);
    }

    public function show(Post $post): JsonResponse
    {
        return $this->_show($post);
    }

    public function update(UpdatePostRequest $request, Post $post, PostService $posts): JsonResponse
    {
        $post = $this->refresh($post);
        $post = $posts->adminUpdate($post, $request->validated());

        return $this->success(new PostResource($this->refresh($post)), 'Post updated.');
    }

    public function reprocess(Post $post, PostService $posts): JsonResponse
    {
        $post = $this->refresh($post);

        try {
            $post = $posts->reprocess($post);
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'post' => [$e->getMessage()],
            ]);
        }

        return $this->success(new PostResource($this->refresh($post)), 'Post reprocessing queued.');
    }

    public function destroy(Post $post, PostService $posts): JsonResponse
    {
        $post = $this->refresh($post);
        $posts->remove($post);

        return $this->noContent();
    }
}
