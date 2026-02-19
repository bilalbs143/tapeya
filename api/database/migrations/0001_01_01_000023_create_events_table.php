<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('contact_person_name');
            $table->string('contact_phone', 30);
            $table->string('event_name');
            $table->string('event_type', 30);
            $table->string('cricket_format', 30);
            $table->string('venue_name');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('number_of_matches');
            $table->unsignedInteger('number_of_teams');
            $table->unsignedInteger('expected_players_count');
            $table->string('country', 100)->nullable();
            $table->string('city', 100);
            $table->string('match_timings', 30);
            $table->string('status', 20)->default('active');
            $table->string('display_image')->nullable();
            $table->string('cover_image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
