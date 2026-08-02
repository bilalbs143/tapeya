<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('viewer_key', 64);
            $table->unsignedInteger('watched_ms')->default(0);
            $table->decimal('completion_rate', 5, 2)->nullable();
            $table->boolean('counted')->default(false);
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->unique(['post_id', 'viewer_key']);
            $table->index(['post_id', 'counted']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_views');
    }
};
