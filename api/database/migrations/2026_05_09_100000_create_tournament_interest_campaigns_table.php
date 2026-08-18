<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_interest_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('tournament_name');
            $table->string('slug', 191)->unique();
            $table->text('description')->nullable();
            $table->json('form_fields')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('show_in_sidebar')->default(false);
            $table->boolean('show_dialog')->default(false);
            $table->string('status', 20)->default('open');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tournament_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_interest_campaigns');
    }
};
