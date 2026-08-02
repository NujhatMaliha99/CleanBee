<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Nujhat',
            'last_name'  => 'Maliha',
            'email'      => 'nujhat@example.com',
            'password'   => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'nujhat@example.com',
        ]);
    }

    public function test_registration_validation_fails_for_invalid_email(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Nujhat',
            'email'      => 'invalid-email',
            'password'   => '123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'nujhat@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_login_normalizes_email_address(): void
    {
        User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => '  NUJHAT@EXAMPLE.COM  ',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('user.email', 'nujhat@example.com');
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'nujhat@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid email or password']);
    }

    public function test_protected_user_route_requires_authentication(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_role_middleware_blocks_regular_users_from_admin_route(): void
    {
        $user = User::create([
            'first_name' => 'Regular',
            'email'      => 'user@example.com',
            'password'   => Hash::make('password123'),
            'role'       => 'user',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/admin/reports');
        $response->assertStatus(403);
    }

    public function test_user_can_logout_successfully(): void
    {
        $user = User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Successfully logged out']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
