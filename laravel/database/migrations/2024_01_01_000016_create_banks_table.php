<?php

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
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('names')->nullable();
            $table->string('code')->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->foreignIdFor(User::class, 'restored_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->timestamp('restored_at')->nullable();
            $table->foreignIdFor(User::class, 'deleted_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
