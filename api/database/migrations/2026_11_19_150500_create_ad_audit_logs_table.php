<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('entity_type', 64);
            $table->unsignedBigInteger('entity_id');
            $table->string('action', 64);
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_audit_logs');
    }
};
