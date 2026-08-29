<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('area_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('assigned_volunteer_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title');

            $table->text('description');

            $table->string('waste_type');

            $table->text('address');

            $table->decimal('latitude', 10, 7);

            $table->decimal('longitude', 10, 7);

            $table->string('image_path')->nullable();

            $table->string('status')
                ->default('pending');

            $table->timestamp('assigned_at')
                ->nullable();

            $table->timestamp('resolved_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_reports');
    }
};