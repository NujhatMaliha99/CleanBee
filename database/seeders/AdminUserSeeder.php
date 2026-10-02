<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower(trim((string) config('admin.email')));
        $password = (string) config('admin.password');

        if ($email === '' || $password === '') {
            throw new RuntimeException('ADMIN_EMAIL and ADMIN_PASSWORD must be configured before seeding the administrator.');
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => config('admin.first_name'),
                'last_name' => config('admin.last_name'),
                'password' => Hash::make($password),
                'role' => 'admin',
                'email_verified_at' => now(),
                'volunteer_enabled' => false,
                'volunteer_availability' => 'unavailable',
            ]
        );
    }
}
