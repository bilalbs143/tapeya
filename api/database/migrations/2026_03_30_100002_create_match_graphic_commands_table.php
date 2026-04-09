<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_graphic_commands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_graphic_session_id')
                ->constrained('match_graphic_sessions')
                ->cascadeOnDelete();
            $table->string('command_type', 40);
            $table->string('command_key', 64);
            $table->json('payload')->nullable();
            $table->string('display_mode', 20)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::table('match_graphic_sessions', function (Blueprint $table) {
            $table->foreign('active_command_id')
                ->references('id')
                ->on('match_graphic_commands')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('match_graphic_sessions', function (Blueprint $table) {
            $table->dropForeign(['active_command_id']);
        });

        Schema::dropIfExists('match_graphic_commands');
    }
};
