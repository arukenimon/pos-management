<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\PlatformAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_grants_and_revokes_explicitly_and_protects_the_final_admin(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();
        $this->artisan('app:super-admin', ['email' => $first->email, '--reason' => 'Initial operator'])->assertSuccessful();
        $this->assertTrue($first->fresh()->is_super_admin);
        $this->artisan('app:super-admin', ['email' => $first->email, '--reason' => 'Duplicate grant'])->assertSuccessful();
        $this->assertDatabaseCount('platform_audit_logs', 1);
        $this->artisan('app:super-admin', ['email' => $first->email, '--revoke' => true, '--reason' => 'Final operator'])->assertFailed();
        $this->assertTrue($first->fresh()->is_super_admin);
        $this->artisan('app:super-admin', ['email' => $second->email, '--reason' => 'Backup operator'])->assertSuccessful();
        $this->artisan('app:super-admin', ['email' => $first->email, '--revoke' => true, '--reason' => 'Operator handoff'])->assertSuccessful();
        $this->assertFalse($first->fresh()->is_super_admin);
        $this->assertDatabaseHas('platform_audit_logs', ['action' => 'super_admin.revoked', 'reason' => 'Operator handoff']);
        $this->assertSame(['name' => 'Server command'], PlatformAuditLog::first()->actor);
    }

    public function test_command_requires_existing_active_verified_accounts_and_reason(): void
    {
        $unverified = User::factory()->unverified()->create();
        $suspended = User::factory()->create(['suspended_at' => now()]);
        $normal = User::factory()->create(['role' => 'admin']);
        foreach ([$unverified->email, $suspended->email, 'missing@example.test'] as $email) {
            $this->artisan('app:super-admin', ['email' => $email, '--reason' => 'Invalid account'])->assertFailed();
        }
        $this->artisan('app:super-admin', ['email' => $normal->email])->assertFailed();
        $this->assertFalse($normal->fresh()->is_super_admin);
        $this->assertDatabaseCount('platform_audit_logs', 0);
    }
}
