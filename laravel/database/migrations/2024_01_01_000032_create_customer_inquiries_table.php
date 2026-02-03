<?php

use App\Enums\CustomerInquiry\CustomerInquiryStatusEnum;
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
        Schema::create('customer_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index()->nullable();
            $table->string('title')->nullable();
            $table->string('content')->nullable();
            $table->string('status')->default(CustomerInquiryStatusEnum::PENDING->value)->index();
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
        Schema::dropIfExists('customer_inquiries');
    }
};
