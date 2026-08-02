<?php

namespace App\Services\Post;

use App\Models\Hashtag;
use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostHashtagParser
{
    /**
     * Extract unique lowercase hashtag names from caption text (without #).
     *
     * @return list<string>
     */
    public function extract(string $caption): array
    {
        if ($caption === '') {
            return [];
        }

        preg_match_all('/#([\p{L}\p{N}_]{1,100})/u', $caption, $matches);
        $tags = [];
        foreach ($matches[1] ?? [] as $raw) {
            $name = Str::lower($raw);
            if ($name !== '') {
                $tags[$name] = true;
            }
        }

        return array_keys($tags);
    }

    /**
     * Sync reel ↔ hashtag pivots from caption; updates hashtag posts_count.
     */
    public function syncForPost(Post $post): void
    {
        $names = $this->extract((string) ($post->body ?? ''));

        DB::transaction(function () use ($post, $names) {
            $previousIds = $post->hashtags()->pluck('hashtags.id')->all();

            $nextIds = [];
            foreach ($names as $name) {
                $hashtag = Hashtag::query()->firstOrCreate(
                    ['name' => $name],
                    ['posts_count' => 0]
                );
                $nextIds[] = $hashtag->id;
            }

            $post->hashtags()->sync($nextIds);

            $detached = array_diff($previousIds, $nextIds);
            $attached = array_diff($nextIds, $previousIds);

            if ($detached !== []) {
                Hashtag::query()->whereIn('id', $detached)->where('posts_count', '>', 0)->decrement('posts_count');
            }
            if ($attached !== []) {
                Hashtag::query()->whereIn('id', $attached)->increment('posts_count');
            }
        });
    }
}
