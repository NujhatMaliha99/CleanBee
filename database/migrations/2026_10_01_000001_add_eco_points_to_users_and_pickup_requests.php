<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('eco_points')->default(0);
        });

        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->unsignedInteger('earned_points')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropColumn('earned_points');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('eco_points');
        });
    }
};
