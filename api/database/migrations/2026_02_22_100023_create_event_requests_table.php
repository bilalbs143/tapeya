<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('contact_person_name');
            $table->string('contact_phone', 30);
            $table->string('tournament_name');
            $table->string('tournament_type', 30);
            $table->string('cricket_format', 30);
            $table->string('venue_name');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('number_of_matches');
            $table->unsignedInteger('number_of_teams');
            $table->unsignedTinyInteger('number_of_groups')->default(1);
            $table->unsignedInteger('expected_players_count');
            $table->string('country', 100)->nullable();
            $table->string('city', 100);
            $table->string('match_timings', 30);
            $table->string('prize', 255)->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_requests');
    }
};
