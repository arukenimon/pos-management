<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $users = [
            [
                'name'     => 'Admin',
                'email'    => 'admin@pos.com',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Cashier',
                'email'    => 'cashier@pos.com',
                'password' => Hash::make('password'),
                'role'     => 'cashier',
            ],
            [
                'name'     => 'Guest',
                'email'    => 'guest@pos.com',
                'password' => Hash::make('password'),
                'role'     => 'guest',
            ],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }
    }
}

