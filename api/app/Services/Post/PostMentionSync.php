<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Models\PostMention;
use App\Support\Post\PostMentionParser;
use Illuminate\Support\Facades\DB;

/**
 * Sync caption @mentions onto post_mentions and report newly attached user ids.
 */
class PostMentionSync
{
    /**
     * @return list<int> Newly attached mentioned user ids (for notification fan-out)
     */
    public function syncForPost(Post $post): array
    {
        $users = PostMentionParser::resolveUsers((string) ($post->body ?? ''));
        $nextIds = $users->pluck('id')->map(fn ($id) => (int) $id)->unique()->values()->all();

        return DB::transaction(function () use ($post, $nextIds) {
            $previousIds = PostMention::query()
                ->where('post_id', $post->id)
                ->pluck('mentioned_user_id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $detach = array_values(array_diff($previousIds, $nextIds));
            if ($detach !== []) {
                PostMention::query()
                    ->where('post_id', $post->id)
                    ->whereIn('mentioned_user_id', $detach)
                    ->delete();
            }

            $attach = array_values(array_diff($nextIds, $previousIds));
            foreach ($attach as $userId) {
                PostMention::query()->firstOrCreate([
                    'post_id' => $post->id,
                    'mentioned_user_id' => $userId,
                ]);
            }

            return $attach;
        });
    }
}
