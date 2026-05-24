<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Support\MediaRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Generic media-management controller.
 *
 * POST   /admin/media/{type}/{id}/{field}  — upload/replace
 * DELETE /admin/media/{type}/{id}/{field}  — delete
 *
 * All recognised types and fields are declared in {@see MediaRegistry}.
 */
class MediaController extends Controller
{
    use BaseControllerTrait;

    /**
     * Upload (or replace) a media field on any registered model.
     *
     * Single-file: multipart body key "file"
     * Multiple:    multipart body key "files[]"
     */
    public function upload(Request $request, string $type, int $id, string $field): JsonResponse
    {
        try {
            [$record, $config] = MediaRegistry::resolve($type, $id, $field);
        } catch (\InvalidArgumentException $e) {
            return $this->notFound($e->getMessage());
        }

        $disk = config('filesystems.media_disk');
        $multiple = $config['multiple'] ?? false;

        if ($multiple) {
            $request->validate([
                'files' => ['required', 'array', 'min:1'],
                'files.*' => ['image', 'max:5120'],
            ]);

            $relation = $config['relation'];
            $pathCol = $config['relation_path_col'];
            $sortOrder = $record->$relation()->count();
            $results = [];

            foreach ($request->file('files', []) as $file) {
                $path = $file->store($config['dir'], $disk);
                $pivot = $record->$relation()->create([
                    $pathCol => $path,
                    'sort_order' => $sortOrder++,
                ]);
                $results[] = [
                    'id' => $pivot->id,
                    'url' => Storage::disk($disk)->url($path),
                ];
            }

            return $this->success(['images' => $results]);
        }

        // Single-file replacement
        $request->validate(['file' => ['required', 'image', 'max:5120']]);

        $column = $config['column'];
        $oldPath = $record->getRawOriginal($column);

        if ($oldPath) {
            Storage::disk($disk)->delete($oldPath);
        }

        $path = $request->file('file')->store($config['dir'], $disk);
        $record->update([$column => $path]);

        return $this->success(['url' => Storage::disk($disk)->url($path)]);
    }

    /**
     * Delete a media field from any registered model.
     *
     * Multiple (e.g. product images): pass JSON body {"url": "..."} to
     * identify which image to remove by its full storage URL.
     */
    public function delete(Request $request, string $type, int $id, string $field): JsonResponse
    {
        try {
            [$record, $config] = MediaRegistry::resolve($type, $id, $field);
        } catch (\InvalidArgumentException $e) {
            return $this->notFound($e->getMessage());
        }

        $disk = config('filesystems.media_disk');
        $multiple = $config['multiple'] ?? false;

        if ($multiple) {
            $request->validate(['url' => ['required', 'string']]);

            $relation = $config['relation'];
            $pathCol = $config['relation_path_col'];
            $url = $request->input('url');

            $target = $record->$relation()->get()->first(
                fn ($img) => Storage::disk($disk)->url($img->$pathCol) === $url
            );

            if (! $target) {
                return $this->notFound('Image not found.');
            }

            Storage::disk($disk)->delete($target->$pathCol);
            $target->delete();

            return $this->noContent();
        }

        // Single-file removal
        $column = $config['column'];
        $path = $record->getRawOriginal($column);

        if ($path) {
            Storage::disk($disk)->delete($path);
        }

        $record->update([$column => null]);

        return $this->noContent();
    }
}
