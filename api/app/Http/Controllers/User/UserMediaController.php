<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Events\Broadcast\Post\PostProcessingUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Team;
use App\Models\TournamentInterestSubmission;
use App\Models\TournamentMatch;
use App\Services\Post\PostService;
use App\Settings\PostsSettings;
use App\Support\Media\MediaDisk;
use App\Support\PhpUploadError;
use App\Support\Post\PostImageStorage;
use App\Support\Post\PostVideoFormats;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * User-scoped generic media upload / delete.
 *
 * POST   /api/v1/media/{type}/{id}/{field}   — upload or replace a media field
 * DELETE /api/v1/media/{type}/{id}/{field}   — remove a media field
 *
 * Requires an authenticated app user (Sanctum). Ownership is enforced for
 * interest-submission and reel (video post) types.
 *
 * Registered types and fields:
 *   team / logo
 *   match / thumbnail
 *   interest-submission / profile_picture
 *   interest-submission / id_document
 *   reel / original   (video post — type key kept for app compat)
 *   reel / thumbnail
 */
class UserMediaController extends Controller
{
    use BaseControllerTrait;

    /**
     * Type → model + field storage config.
     * 'column' is the DB column that stores the raw path.
     * 'file_rules' is the Laravel validation rule array for the 'file' key.
     *
     * @return array<string, array{model: class-string<Model>, fields: array<string, array<string, mixed>>}>
     */
    private static function types(): array
    {
        return [
            'team' => [
                'model' => Team::class,
                'fields' => [
                    'logo' => [
                        'dir' => 'teams',
                        'column' => 'logo',
                        'file_rules' => ['required', 'image', 'max:5120'],
                    ],
                ],
            ],
            'match' => [
                'model' => TournamentMatch::class,
                'fields' => [
                    'thumbnail' => [
                        'dir' => 'match-stream-thumbnails',
                        'column' => 'stream_thumbnail',
                        'file_rules' => ['required', 'image', 'max:5120'],
                    ],
                ],
            ],
            'interest-submission' => [
                'model' => TournamentInterestSubmission::class,
                'fields' => [
                    'profile_picture' => [
                        'dir' => 'interest/profile-pictures',
                        'column' => 'profile_picture_path',
                        'file_rules' => ['required', 'image', 'max:5120'],
                    ],
                    'id_document' => [
                        'dir' => 'interest/id-documents',
                        'column' => 'id_document_path',
                        'file_rules' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
                    ],
                ],
            ],
            'reel' => [
                'model' => Post::class,
                'fields' => [
                    'original' => [
                        'dir' => 'posts/videos/original',
                        'column' => 'original_path',
                        'file_rules' => PostVideoFormats::fileRules(),
                    ],
                    'thumbnail' => [
                        'dir' => 'posts/videos/thumbs',
                        'column' => 'thumbnail_path',
                        'file_rules' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Upload (or replace) a media field. Multipart body key: "file"
     */
    public function upload(Request $request, string $type, int $id, string $field): JsonResponse
    {
        $resolved = $this->resolveRecord($request, $type, $id, $field);
        if ($resolved instanceof JsonResponse) {
            return $resolved;
        }

        [$record, $config] = $resolved;

        $maxKb = $type === 'reel' && $field === 'original'
            ? app(PostsSettings::class)->maxUploadKbForValidation()
            : null;

        $rules = $config['file_rules'];
        if ($maxKb !== null) {
            $rules[] = 'max:'.$maxKb;
        }

        if ($message = PhpUploadError::message($request->file('file'))) {
            return $this->failure($message, 'VALIDATION_ERROR', ['file' => [$message]]);
        }

        $request->validate(['file' => $rules]);

        $column = $config['column'];

        // Provisional client posters must not overwrite the FFmpeg poster after the original lands
        // (thumb upload races multipart complete → ExtractPostPosterJob force-refine).
        if ($type === 'reel' && $field === 'thumbnail' && $record instanceof Post && $record->videoRaw('original_path')) {
            $existing = $record->videoRaw('thumbnail_path') ?: $record->getRawOriginal('cover_path');

            return $this->success([
                'url' => $existing ? MediaDisk::url($existing) : null,
                'status' => $record->status?->value,
            ]);
        }

        $oldPath = $type === 'reel'
            ? ($record instanceof Post ? $record->videoRaw($column) : null)
            : $record->getRawOriginal($column);

        if ($oldPath) {
            MediaDisk::delete($oldPath);
        }

        $dir = $config['dir'];
        if ($type === 'reel') {
            $dir = $config['dir'].'/'.$record->id;
        }

        $file = $request->file('file');
        $path = null;

        if ($type === 'reel' && $field === 'thumbnail' && $record instanceof Post) {
            try {
                $stored = PostImageStorage::storeFromUpload($file, $record->id, 'posts/videos/thumbs');
                $path = $stored['path'];
            } catch (\Throwable) {
                // Best-effort WebP — fall back to raw store so provisional posters never block upload.
                $path = MediaDisk::storeUploaded($file, $dir);
            }
        } else {
            $path = MediaDisk::storeUploaded($file, $dir);
        }

        if ($type === 'reel' && $record instanceof Post) {
            $record->fillVideo([$column => $path]);
            if ($field === 'thumbnail') {
                $oldCover = $record->getRawOriginal('cover_path');
                $record->forceFill(['cover_path' => $path])->save();
                if (is_string($oldCover) && $oldCover !== '' && $oldCover !== $path && $oldCover !== $oldPath) {
                    MediaDisk::delete($oldCover);
                }
                event(new PostProcessingUpdated($record->fresh(['video']) ?? $record));
            }
            if ($field === 'original') {
                app(PostService::class)->markOriginalUploaded($record);
            }
            $record->refresh();
        } else {
            $record->update([$column => $path]);
        }

        // Permanent CDN URL via MediaCdn / MediaDisk (no signed playback URLs).
        return $this->success([
            'url' => MediaDisk::url($path),
            'status' => $type === 'reel' && $record instanceof Post
                ? $record->status?->value
                : null,
        ]);
    }

    /**
     * Delete a media field.
     */
    public function delete(Request $request, string $type, int $id, string $field): JsonResponse
    {
        $resolved = $this->resolveRecord($request, $type, $id, $field);
        if ($resolved instanceof JsonResponse) {
            return $resolved;
        }

        [$record, $config] = $resolved;

        $column = $config['column'];
        $oldPath = $record->getRawOriginal($column);

        if ($oldPath) {
            MediaDisk::delete($oldPath);
        }

        $record->update([$column => null]);

        return $this->noContent();
    }

    /**
     * Validate type/field and load the target record (no ownership gate).
     *
     * @return array{0: Model, 1: array<string,mixed>} | JsonResponse
     */
    private function resolveRecord(Request $request, string $type, int $id, string $field): array|JsonResponse
    {
        $types = self::types();

        if (! array_key_exists($type, $types)) {
            return $this->notFound("Unknown media type: {$type}");
        }

        $typeConfig = $types[$type];

        if (! array_key_exists($field, $typeConfig['fields'])) {
            return $this->notFound("Unknown field '{$field}' for type '{$type}'.");
        }

        /** @var class-string<Model> $modelClass */
        $modelClass = $typeConfig['model'];
        $record = $modelClass::query()->find($id);

        if ($record === null) {
            return $this->notFound('Record not found.');
        }

        if ($type === 'interest-submission') {
            /** @var TournamentInterestSubmission $record */
            if ($record->user_id !== $request->user()?->id) {
                return $this->forbidden('You cannot modify this submission.');
            }

            $campaign = $record->campaign()->first();

            if (! TournamentInterestFormFieldEnum::isFileField($field) || $campaign === null || ! $campaign->formFieldEnabled($field)) {
                return $this->failure('This upload field is not enabled for this interest form.', 'VALIDATION_ERROR');
            }
        }

        if ($type === 'reel') {
            /** @var Post $record */
            if ($record->user_id !== $request->user()?->id) {
                return $this->forbidden('You cannot modify this reel.');
            }
        }

        return [$record, $typeConfig['fields'][$field]];
    }
}
