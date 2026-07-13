<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\TournamentInterestSubmission;
use App\Models\TournamentMatch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * User-scoped generic media upload / delete.
 *
 * POST   /api/v1/media/{type}/{id}/{field}   — upload or replace a media field
 * DELETE /api/v1/media/{type}/{id}/{field}   — remove a media field
 *
 * Requires an authenticated app user (Sanctum). Does not re-check record ownership here —
 * callers should only hit this after the user already passed authorization on the parent
 * resource (team update, match scoring, interest submit, etc.).
 *
 * Registered types and fields:
 *   team / logo
 *   match / thumbnail
 *   interest-submission / profile_picture
 *   interest-submission / id_document
 */
class UserMediaController extends Controller
{
    use BaseControllerTrait;

    /**
     * Type → model + field storage config.
     * 'column' is the DB column that stores the raw path.
     * 'file_rules' is the Laravel validation rule array for the 'file' key.
     *
     * @var array<string, array{model: class-string<Model>, fields: array<string, array<string, mixed>>}>
     */
    private const TYPES = [
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
    ];

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

        $request->validate(['file' => $config['file_rules']]);

        $disk = config('filesystems.media_disk');
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
     * Delete a media field.
     */
    public function delete(Request $request, string $type, int $id, string $field): JsonResponse
    {
        $resolved = $this->resolveRecord($request, $type, $id, $field);
        if ($resolved instanceof JsonResponse) {
            return $resolved;
        }

        [$record, $config] = $resolved;

        $disk = config('filesystems.media_disk');
        $column = $config['column'];
        $oldPath = $record->getRawOriginal($column);

        if ($oldPath) {
            Storage::disk($disk)->delete($oldPath);
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
        if (! array_key_exists($type, self::TYPES)) {
            return $this->notFound("Unknown media type: {$type}");
        }

        $typeConfig = self::TYPES[$type];

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

        return [$record, $typeConfig['fields'][$field]];
    }
}
