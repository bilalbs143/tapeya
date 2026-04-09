<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class GraphicTheme extends BaseModel
{
    protected $fillable = [
        'slug',
        'name',
        'config_schema',
        'default_config',
        'graphics_url_template',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config_schema' => 'array',
            'default_config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function graphicSessions(): HasMany
    {
        return $this->hasMany(MatchGraphicSession::class, 'graphic_theme_id');
    }
}
