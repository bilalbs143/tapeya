<?php

use App\Models\Bank;
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
        Schema::create('user_banks', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->index()->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(Bank::class)->index()->constrained('banks')->cascadeOnDelete();
            $table->string('account_number');
            $table->string('account_holder')->fulltext();
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['user_id', 'bank_id', 'account_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_banks');
    }
};
