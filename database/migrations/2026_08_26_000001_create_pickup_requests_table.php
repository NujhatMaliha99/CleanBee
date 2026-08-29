<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_volunteer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('waste_type');
            $table->decimal('quantity', 10, 2);
            $table->string('quantity_unit', 20);
            $table->text('pickup_address');
            $table->date('pickup_date');
            $table->time('pickup_time');
            $table->string('contact_phone', 30);
            $table->text('instructions')->nullable();
            $table->string('image_path')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'pickup_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_requests');
    }
};
