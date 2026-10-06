<?php

use App\Enums\Tournament\ReactionEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drama_episodes', function (Blueprint $table) {
            $table->unsignedBigInteger('dislikes_count')->default(0)->after('likes_count');
            $table->unsignedBigInteger('shares_count')->default(0)->after('comments_count');
        });

        Schema::create('drama_episode_user_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drama_episode_id')->constrained('drama_episodes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reaction');
            $table->timestamps();

            $table->unique(['drama_episode_id', 'user_id']);
            $table->index('user_id');
        });

        if (Schema::hasTable('drama_episode_likes')) {
            $likes = DB::table('drama_episode_likes')->get(['drama_episode_id', 'user_id', 'created_at', 'updated_at']);
            foreach ($likes as $like) {
                DB::table('drama_episode_user_reactions')->insertOrIgnore([
                    'drama_episode_id' => $like->drama_episode_id,
                    'user_id' => $like->user_id,
                    'reaction' => ReactionEnum::LIKE->value,
                    'created_at' => $like->created_at,
                    'updated_at' => $like->updated_at,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('drama_episode_user_reactions');

        Schema::table('drama_episodes', function (Blueprint $table) {
            $table->dropColumn(['dislikes_count', 'shares_count']);
        });
    }
};
