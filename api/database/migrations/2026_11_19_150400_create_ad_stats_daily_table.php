<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_stats_daily', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('campaign_id')->constrained('ad_campaigns')->cascadeOnDelete();
            $table->foreignId('creative_id')->constrained('ad_creatives')->cascadeOnDelete();
            $table->unsignedBigInteger('impressions_raw')->default(0);
            $table->unsignedBigInteger('impressions_unique')->default(0);
            $table->unsignedBigInteger('views_raw')->default(0);
            $table->unsignedBigInteger('views_unique')->default(0);
            $table->unsignedBigInteger('clicks_raw')->default(0);
            $table->unsignedBigInteger('clicks_unique')->default(0);
            $table->unsignedBigInteger('sum_watched_ms')->default(0);
            $table->timestamps();

            $table->unique(['date', 'campaign_id', 'creative_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_stats_daily');
    }
};
