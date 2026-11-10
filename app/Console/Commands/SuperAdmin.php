<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\PlatformAdministration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SuperAdmin extends Command
{
    protected $signature = 'app:super-admin {email : Existing account email} {--revoke : Remove platform access} {--reason= : Required audit reason}';

    protected $description = 'Grant or revoke platform access for an existing account';

    public function handle(PlatformAdministration $administration): int
    {
        try {
            $data = Validator::make([
                'email' => $this->argument('email'),
                'reason' => trim((string) $this->option('reason')),
            ], ['email' => 'required|email', 'reason' => 'required|string|min:3|max:1000'])->validate();
            $user = User::where('email', $data['email'])->first();
            if (! $user) {
                $this->error('Account not found. Create and verify the account before granting platform access.');

                return self::FAILURE;
            }
            $changed = $administration->setSuperAdmin($user, ! $this->option('revoke'), $data['reason']);
            $this->info($changed ? 'Platform access updated and audited.' : 'Account already has the requested access; no change made.');

            return self::SUCCESS;
        } catch (ValidationException $exception) {
            foreach ($exception->validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }
    }
}
