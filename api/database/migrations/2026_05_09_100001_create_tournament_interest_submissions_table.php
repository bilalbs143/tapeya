<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_interest_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')
                ->constrained('tournament_interest_campaigns')
                ->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('nickname')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('profile_picture_path')->nullable();
            $table->string('id_document_path')->nullable();

            $table->string('status', 20)->default('pending');
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();

            // One submission per (campaign, player); re-submits update the existing row.
            $table->unique(['campaign_id', 'user_id']);
            $table->index(['campaign_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_interest_submissions');
    }
};
