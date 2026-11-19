<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_ad_takes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creative_id')->constrained('ad_creatives')->restrictOnDelete();
            $table->foreignId('campaign_id')->constrained('ad_campaigns')->restrictOnDelete();
            $table->string('mode', 32);
            $table->string('status', 32)->default('draft');
            $table->json('presentation_json')->nullable();
            $table->string('note')->nullable();
            $table->foreignId('started_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('ended_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'started_at']);
            $table->index('creative_id');
            $table->index('campaign_id');
        });

        Schema::create('live_ad_take_streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('take_id')->constrained('live_ad_takes')->cascadeOnDelete();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();

            $table->unique(['take_id', 'stream_id']);
            $table->index('stream_id');
        });

        Schema::table('ad_events', function (Blueprint $table) {
            $table->foreign('take_id')->references('id')->on('live_ad_takes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ad_events', function (Blueprint $table) {
            $table->dropForeign(['take_id']);
        });

        Schema::dropIfExists('live_ad_take_streams');
        Schema::dropIfExists('live_ad_takes');
    }
};
