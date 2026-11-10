<?php

namespace App\Services;

use App\Models\PlatformAuditLog;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PlatformAdministration
{
    public function setSuspended(Shop|User $target, bool $suspended, User $actor, string $reason): bool
    {
        return DB::transaction(function () use ($target, $suspended, $actor, $reason) {
            $target = $target->newQuery()->lockForUpdate()->findOrFail($target->id);
            if ($target instanceof User && $target->is_super_admin) {
                throw ValidationException::withMessages(['status' => 'Super Admin accounts cannot be suspended here. Remove platform access through the server command first.']);
            }
            if (($target->suspended_at !== null) === $suspended) {
                return false;
            }

            $before = ['status' => $target->suspended_at ? 'suspended' : 'active'];
            $target->forceFill([
                'suspended_at' => $suspended ? now() : null,
                'suspension_reason' => $suspended ? $reason : null,
            ])->save();

            if ($suspended && $target instanceof User) {
                $target->forceFill(['remember_token' => Str::random(60)])->save();
                $target->tokens()->delete();
                if (config('session.driver') === 'database') {
                    DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
                        ->where('user_id', $target->id)->delete();
                }
            }

            $type = $target instanceof Shop ? 'shop' : 'user';
            $this->record($target, $actor, $type.'.'.($suspended ? 'suspended' : 'restored'), $reason, $before, [
                'status' => $suspended ? 'suspended' : 'active',
            ]);

            return true;
        });
    }

    public function setSuperAdmin(User $target, bool $grant, string $reason): bool
    {
        return DB::transaction(function () use ($target, $grant, $reason) {
            // Lock the full administrator set in a stable order before counting.
            User::where('is_super_admin', true)->orderBy('id')->lockForUpdate()->get();
            $target = User::lockForUpdate()->findOrFail($target->id);
            if ($grant && ($target->suspended_at || ! $target->hasVerifiedEmail())) {
                throw ValidationException::withMessages(['email' => 'Grant access only to an active account with a verified email address.']);
            }
            if ($target->is_super_admin === $grant) {
                return false;
            }
            if (! $grant && User::where('is_super_admin', true)->whereNull('suspended_at')->whereNotNull('email_verified_at')
                ->where('id', '!=', $target->id)->doesntExist()) {
                throw ValidationException::withMessages(['email' => 'Cannot revoke the final active, verified Super Admin. Grant another account first.']);
            }
            $before = ['is_super_admin' => $target->is_super_admin];
            $target->forceFill(['is_super_admin' => $grant])->save();
            $this->record($target, null, $grant ? 'super_admin.granted' : 'super_admin.revoked', $reason, $before, ['is_super_admin' => $grant]);

            return true;
        });
    }

    private function record(Shop|User $target, ?User $actor, string $action, string $reason, array $before, array $after): void
    {
        PlatformAuditLog::create([
            'actor_id' => $actor?->id,
            'actor' => $actor ? $actor->only(['id', 'name', 'email']) : ['name' => 'Server command'],
            'target_type' => $target instanceof Shop ? 'shop' : 'user',
            'target_id' => $target->id,
            'target' => $target->only($target instanceof Shop ? ['id', 'name', 'slug'] : ['id', 'name', 'email']),
            'action' => $action,
            'reason' => $reason,
            'before_state' => $before,
            'after_state' => $after,
            'created_at' => now(),
        ]);
    }
}
