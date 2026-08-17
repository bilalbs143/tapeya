<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->string('kind', 20)->default('tournament');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cricket_format', 30)->nullable();
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->dropForeign(['tournament_id']);
        });

        DB::statement('ALTER TABLE matches ALTER COLUMN tournament_id DROP NOT NULL');
        DB::statement('ALTER TABLE matches ALTER COLUMN venue_name DROP NOT NULL');

        Schema::table('matches', function (Blueprint $table) {
            $table->foreign('tournament_id')->references('id')->on('tournaments')->cascadeOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('added_via_quick_match')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('added_via_quick_match');
        });

        DB::statement('DELETE FROM matches WHERE tournament_id IS NULL OR venue_name IS NULL');

        Schema::table('matches', function (Blueprint $table) {
            $table->dropForeign(['tournament_id']);
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn(['kind', 'cricket_format']);
        });

        DB::statement('ALTER TABLE matches ALTER COLUMN tournament_id SET NOT NULL');
        DB::statement('ALTER TABLE matches ALTER COLUMN venue_name SET NOT NULL');

        Schema::table('matches', function (Blueprint $table) {
            $table->foreign('tournament_id')->references('id')->on('tournaments')->cascadeOnDelete();
        });
    }
};
