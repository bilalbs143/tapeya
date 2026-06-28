<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tournament_name');
            $table->string('short_name', 64)->nullable();
            $table->string('tournament_type', 30);
            $table->string('cricket_format', 30);
            $table->string('venue_name');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('number_of_teams');
            $table->unsignedTinyInteger('number_of_groups')->default(1);
            $table->string('country', 100)->nullable();
            $table->string('city', 100);
            $table->string('match_timings', 30);
            $table->string('status', 20)->default('active');
            $table->string('stream_provider', 30)->nullable();
            $table->string('display_image')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('prize', 255)->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('dislikes_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
