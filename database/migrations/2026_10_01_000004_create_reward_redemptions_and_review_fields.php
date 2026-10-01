<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('points_spent');
            $table->string('status', 20)->default('completed');
            $table->string('idempotency_key', 100);
            $table->timestamp('redeemed_at');
            $table->timestamps();
            $table->unique(['user_id', 'idempotency_key']);
            $table->index(['user_id', 'redeemed_at']);
        });

        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->string('admin_review_status', 20)->default('approved');
            $table->foreignId('admin_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('admin_reviewed_at')->nullable();
            $table->text('admin_rejection_reason')->nullable();
            $table->string('claim_review_status', 20)->default('approved');
            $table->foreignId('claim_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('claim_reviewed_at')->nullable();
            $table->text('claim_rejection_reason')->nullable();
        });

        Schema::table('area_reports', function (Blueprint $table) {
            $table->string('admin_review_status', 20)->default('approved');
            $table->foreignId('admin_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('admin_reviewed_at')->nullable();
            $table->text('admin_rejection_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('area_reports', function (Blueprint $table) {
            $table->dropForeign(['admin_reviewed_by']);
            $table->dropColumn(['admin_review_status', 'admin_reviewed_by', 'admin_reviewed_at', 'admin_rejection_reason']);
        });
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropForeign(['admin_reviewed_by']);
            $table->dropForeign(['claim_reviewed_by']);
            $table->dropColumn(['admin_review_status', 'admin_reviewed_by', 'admin_reviewed_at', 'admin_rejection_reason', 'claim_review_status', 'claim_reviewed_by', 'claim_reviewed_at', 'claim_rejection_reason']);
        });
        Schema::dropIfExists('reward_redemptions');
    }
};
