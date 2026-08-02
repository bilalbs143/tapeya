<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_official')->default(false)->after('can_broadcast');
            $table->unsignedInteger('reels_count')->default(0)->after('followers_count');
            $table->unsignedInteger('posts_count')->default(0)->after('reels_count');
            $table->unsignedInteger('following_count')->default(0)->after('posts_count');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_official',
                'reels_count',
                'posts_count',
                'following_count',
            ]);
        });
    }
};
