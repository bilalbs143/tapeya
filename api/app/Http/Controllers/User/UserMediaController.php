<?php

namespace App\Http\Controllers\User;

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
 * Ownership is enforced per type: a user can only modify media on records they own.
 * This mirrors the admin MediaController but adds per-type ownership guards.
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
     * Type → field → storage config.
     * 'column' is the DB column that stores the raw path.
     * 'file_rules' is the Laravel validation rule array for the 'file' key.
     */
    private const TYPES = [
        'team' => [
            'fields' => [
                'logo' => [
                    'dir' => 'teams',
                    'column' => 'logo',
                    'file_rules' => ['required', 'image', 'max:5120'],
                ],
            ],
        ],
        'match' => [
            'fields' => [
                'thumbnail' => [
                    'dir' => 'match-stream-thumbnails',
                    'column' => 'stream_thumbnail',
                    'file_rules' => ['required', 'image', 'max:5120'],
                ],
            ],
        ],
        'interest-submission' => [
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
     * Upload (or replace) a media field on a user-owned record.
     * Multipart body key: "file"
     */
    public function upload(Request $request, string $type, int $id, string $field): JsonResponse
    {
        $resolved = $this->resolveOwned($request, $type, $id, $field);
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
     * Delete a media field from a user-owned record.
     */
    public function delete(Request $request, string $type, int $id, string $field): JsonResponse
    {
        $resolved = $this->resolveOwned($request, $type, $id, $field);
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

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Validate type/field, find the record, enforce ownership.
     *
     * @return array{0: Model, 1: array<string,mixed>} | JsonResponse
     */
    private function resolveOwned(Request $request, string $type, int $id, string $field): array|JsonResponse
    {
        if (! array_key_exists($type, self::TYPES)) {
            return $this->notFound("Unknown media type: {$type}");
        }

        $typeConfig = self::TYPES[$type];

        if (! array_key_exists($field, $typeConfig['fields'])) {
            return $this->notFound("Unknown field '{$field}' for type '{$type}'.");
        }

        $userId = $request->user()?->id;
        $record = $this->findOwned($type, $id, $userId);

        if ($record === null) {
            return $this->notFound('Record not found or access denied.');
        }

        return [$record, $typeConfig['fields'][$field]];
    }

    /**
     * Find a record by type, enforcing that it belongs to the given user.
     */
    private function findOwned(string $type, int $id, ?int $userId): ?Model
    {
        if ($userId === null) {
            return null;
        }

        return match ($type) {
            // Team: the authenticated user must be the owner (sponsor).
            'team' => Team::where('id', $id)
                ->where('user_id', $userId)
                ->first(),

            // Match: the authenticated user must be the organizer of the tournament.
            'match' => TournamentMatch::whereHas(
                'tournament',
                fn ($q) => $q->where('user_id', $userId)
            )->where('id', $id)->first(),

            // Interest submission: the authenticated user must own the submission.
            'interest-submission' => TournamentInterestSubmission::where('id', $id)
                ->where('user_id', $userId)
                ->first(),

            default => null,
        };
    }
}
