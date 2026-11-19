<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('ad_campaigns')->cascadeOnDelete();
            $table->foreignId('creative_id')->constrained('ad_creatives')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('brand_partner_id')->constrained('brand_partners')->cascadeOnDelete();
            $table->unsignedBigInteger('take_id')->nullable();
            $table->string('event_type', 32);
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('viewer_key', 128);
            $table->string('surface', 32);
            $table->string('platform', 32)->nullable();
            $table->unsignedInteger('watched_ms')->nullable();
            $table->decimal('completion_rate', 5, 4)->nullable();
            $table->uuid('client_event_id')->unique();
            $table->timestamp('occurred_at');
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['campaign_id', 'event_type', 'occurred_at']);
            $table->index(['creative_id', 'occurred_at']);
            $table->index(['user_id', 'creative_id', 'event_type', 'occurred_at'], 'ad_events_user_creative_type_occurred_idx');
            $table->index('take_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_events');
    }
};
