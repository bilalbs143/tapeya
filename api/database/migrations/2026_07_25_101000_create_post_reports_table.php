<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 64);
            $table->text('details')->nullable();
            $table->string('status', 32)->default('open');
            $table->timestamps();

            $table->unique(['post_id', 'reporter_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_reports');
    }
};
