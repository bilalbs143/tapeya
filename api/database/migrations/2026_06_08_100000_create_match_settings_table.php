<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')
                ->unique()
                ->constrained('matches')
                ->cascadeOnDelete();

            $table->text('umpires')->nullable();
            $table->text('scorers')->nullable();
            $table->text('commentators')->nullable();

            $table->timestamps();
        });

        // Rename stored graphic command key COMM → COMMENTATORS (enum value change).
        DB::table('match_graphic_commands')
            ->where('command_key', 'COMM')
            ->update(['command_key' => 'COMMENTATORS']);
    }

    public function down(): void
    {
        DB::table('match_graphic_commands')
            ->where('command_key', 'COMMENTATORS')
            ->update(['command_key' => 'COMM']);

        Schema::dropIfExists('match_settings');
    }
};
