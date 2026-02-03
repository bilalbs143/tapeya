<?php

use App\Models\Sound;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sound_settings', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->foreignIdFor(Sound::class)->index()->constrained('sounds')->cascadeOnDelete();
            $table->auditFields();

            $table->unique(['type', 'sound_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sound_settings');
    }
};
