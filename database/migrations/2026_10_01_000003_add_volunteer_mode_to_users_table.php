<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('volunteer_enabled')->default(false);
            $table->string('volunteer_availability', 20)->default('unavailable');
        });

        DB::table('users')
            ->where('role', 'volunteer')
            ->update([
                'volunteer_enabled' => true,
                'volunteer_availability' => 'available',
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['volunteer_enabled', 'volunteer_availability']);
        });
    }
};
