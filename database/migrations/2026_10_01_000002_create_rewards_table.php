<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('points_required');
            $table->string('icon', 30)->default('gift');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();

        DB::table('rewards')->insert([
            [
                'name' => '৳100 mobile top-up',
                'description' => 'Redeem points for a mobile balance top-up.',
                'points_required' => 500,
                'icon' => 'coin',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Reusable eco kit',
                'description' => 'A reusable starter kit for a low-waste lifestyle.',
                'points_required' => 1200,
                'icon' => 'gift',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'A tree planted in your name',
                'description' => 'Support local tree planting through CleanBee.',
                'points_required' => 2000,
                'icon' => 'leaf',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};
