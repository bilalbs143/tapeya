<?php

namespace App\Models;

use App\Support\Media\MediaDisk;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class DramaSerial extends BaseModel
{
    use DateFilterTrait;

    protected $table = 'drama_serials';

    protected $fillable = [
        'title',
        'description',
        'poster',
        'is_active',
        'episodes_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'episodes_count' => 'integer',
        ];
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(DramaEpisode::class)->orderBy('episode_number');
    }

    public function posterUrl(): ?string
    {
        return MediaDisk::url($this->getRawOriginal('poster'));
    }

    public function refreshEpisodesCount(): void
    {
        $this->update([
            'episodes_count' => $this->episodes()->where('is_active', true)->count(),
        ]);
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::partial('title'),
            AllowedFilter::partial('search', 'title'),
            AllowedFilter::exact('is_active'),
            AllowedFilter::scope('created_between'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'title',
            'episodes_count',
            'created_at',
            'updated_at',
        ];
    }
}
