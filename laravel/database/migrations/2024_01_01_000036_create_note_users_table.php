<?php

use App\Models\Note;
use App\Models\User;
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
        Schema::create('note_users', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Note::class)->index()->constrained('notes')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(User::class)->index()->constrained('users')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'read_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_users');
    }
};
