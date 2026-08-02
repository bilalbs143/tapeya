<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Hashtag extends Model
{
    protected $table = 'hashtags';

    protected $fillable = [
        'name',
        'posts_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'posts_count' => 'integer',
        ];
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_hashtag')->withTimestamps();
    }
}
