<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchSetting extends BaseModel
{
    protected $table = 'match_settings';

    protected $fillable = [
        'match_id',
        'umpires',
        'scorers',
        'commentators',
    ];

    /**
     * @var array<string, null>
     */
    private const DEFAULTS = [
        'umpires' => null,
        'scorers' => null,
        'commentators' => null,
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    /**
     * Settings row for a match, or an unsaved model with defaults when none exists.
     */
    public static function resolveFor(TournamentMatch $match): self
    {
        $match->loadMissing('matchSetting');

        if ($match->matchSetting) {
            return $match->matchSetting;
        }

        return new self(array_merge(['match_id' => $match->id], self::DEFAULTS));
    }

    /**
     * Compact settings for API responses and match state.
     *
     * @return array{
     *   umpires: string|null,
     *   scorers: string|null,
     *   commentators: string|null
     * }
     */
    public function toApiArray(): array
    {
        return [
            'umpires' => $this->normalizedText($this->umpires),
            'scorers' => $this->normalizedText($this->scorers),
            'commentators' => $this->normalizedText($this->commentators),
        ];
    }

    /**
     * Officials fragment for broadcast overlay context (`context.match.officials`).
     *
     * @return array{
     *   umpires: array{text: string, lines: list<string>},
     *   scorers: array{text: string, lines: list<string>},
     *   commentators: array{text: string, lines: list<string>}
     * }
     */
    public function toContextOfficialsFragment(): array
    {
        return [
            'umpires' => $this->officialContextEntry($this->umpires),
            'scorers' => $this->officialContextEntry($this->scorers),
            'commentators' => $this->officialContextEntry($this->commentators),
        ];
    }

    /**
     * @return array{text: string, lines: list<string>}
     */
    private function officialContextEntry(?string $raw): array
    {
        $text = $this->normalizedText($raw) ?? '';

        return [
            'text' => $text,
            'lines' => $this->linesFromText($text),
        ];
    }

    /**
     * @return list<string>
     */
    private function linesFromText(string $text): array
    {
        if ($text === '') {
            return [];
        }

        return array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $text) ?: []),
            static fn (string $line): bool => $line !== '',
        ));
    }

    private function normalizedText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
