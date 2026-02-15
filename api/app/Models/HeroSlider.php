<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\Common\StatusEnum;
use App\Utils\Traits\Model\BaseModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class HeroSlider extends Model
{
    use BaseModelTrait;

    protected $fillable = [
        'image',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'image' => AsFile::class.':hero-sliders,false,media',
            'status' => StatusEnum::class,
        ];
    }

    /** Used by AsFile cast for store path. */
    public function kebab(): string
    {
        return Str::kebab(class_basename($this));
    }

    /**
     * @return array<int, string>
     */
    public static function getFilters(): array
    {
        return [
            'status',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'status',
            'created_at',
            'updated_at',
        ];
    }
}
