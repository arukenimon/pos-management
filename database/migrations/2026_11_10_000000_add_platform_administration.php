<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('shops')->where('slug', 'super-admin')->exists()) {
            throw new RuntimeException('The shop slug "super-admin" conflicts with platform routes. Resolve this shop URL and its links before deploying; no shop has been renamed.');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->index();
            $table->timestamp('suspended_at')->nullable()->index();
            $table->text('suspension_reason')->nullable();
        });
        Schema::table('shops', function (Blueprint $table) {
            $table->timestamp('suspended_at')->nullable()->index();
            $table->text('suspension_reason')->nullable();
        });
        Schema::create('platform_audit_logs', function (Blueprint $table) {
            $table->id();
            // Snapshots deliberately survive account and shop deletion.
            $table->unsignedBigInteger('actor_id')->nullable()->index();
            $table->json('actor');
            $table->string('target_type', 20);
            $table->unsignedBigInteger('target_id');
            $table->json('target');
            $table->string('action', 50)->index();
            $table->text('reason');
            $table->json('before_state');
            $table->json('after_state');
            $table->timestamp('created_at')->index();
            $table->index(['target_type', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_audit_logs');
        Schema::table('shops', function (Blueprint $table) {
            $table->dropIndex(['suspended_at']);
            $table->dropColumn(['suspended_at', 'suspension_reason']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_super_admin']);
            $table->dropIndex(['suspended_at']);
            $table->dropColumn(['is_super_admin', 'suspended_at', 'suspension_reason']);
        });
    }
};
