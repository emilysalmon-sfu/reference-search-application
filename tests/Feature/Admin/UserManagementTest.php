<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

function userPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'New Person',
        'email' => 'new@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        'role' => User::ROLE_APPROVER,
    ], $overrides);
}

test('only admins can manage users', function (string $method, string $uri) {
    $target = User::factory()->create();
    $uri = str_replace('{id}', $target->id, $uri);

    $approver = approver();

    $this->{$method}($uri)->assertRedirect(route('login'));

    $this->actingAs($approver)
        ->{$method}($uri)
        ->assertRedirect('/admin/dashboard')
        ->assertSessionHas('error', 'You do not have permission to access this page.');

    $this->actingAs($approver)->{$method.'Json'}($uri)->assertForbidden();
})->with([
    ['get', '/admin/users'],
    ['get', '/admin/users/search'],
    ['post', '/admin/users'],
    ['put', '/admin/users/{id}'],
    ['delete', '/admin/users/{id}'],
    ['post', '/admin/users/{id}/reset-password'],
]);

test('admins see users newest first', function () {
    $admin = admin();
    $this->travel(1)->minutes();
    User::factory()->create(['name' => 'Newest']);

    $this->actingAs($admin)
        ->get('/admin/users?per_page=1')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Users/users')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Newest')
            ->where('users.total', 2)
        );
});

test('admins can search users by name or email', function (string $search) {
    User::factory()->create(['name' => 'Ana Lima', 'email' => 'ana@lima.dev']);
    User::factory()->create(['name' => 'Bob', 'email' => 'bob@example.com']);

    $this->actingAs(admin())
        ->get('/admin/users/search?search='.urlencode($search))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Ana Lima')
        );
})->with(['name' => 'Lima', 'email' => 'lima.dev']);

test('admins can create users', function () {
    Log::spy();
    $admin = admin();

    $this->actingAs($admin)
        ->post('/admin/users', userPayload())
        ->assertSessionHas('success', 'User created successfully.');

    $user = User::firstWhere('email', 'new@example.com');
    expect($user->role)->toBe(User::ROLE_APPROVER)
        ->and(Hash::check('secret-password', $user->password))->toBeTrue();

    Log::shouldHaveReceived('info')->with('User created', Mockery::on(
        fn ($context) => $context['created_user_id'] === $user->id && $context['performed_by_id'] === $admin->id
    ));
});

test('creating users is validated', function (array $payload, string $field) {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs(admin())->post('/admin/users', $payload)->assertSessionHasErrors($field);
})->with([
    'missing name' => [userPayload(['name' => '']), 'name'],
    'bad email' => [userPayload(['email' => 'nope']), 'email'],
    'short password' => [userPayload(['password' => 'short', 'password_confirmation' => 'short']), 'password'],
    'unconfirmed password' => [userPayload(['password_confirmation' => 'different']), 'password'],
    'unknown role' => [userPayload(['role' => 'superuser']), 'role'],
]);

test('creating a user with an existing email explains why', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs(admin())
        ->post('/admin/users', userPayload(['email' => 'taken@example.com']))
        ->assertSessionHasErrors(['email' => 'A user with this email already exists.']);
});

test('admins can update users and the changes are logged', function () {
    Log::spy();
    $user = User::factory()->approver()->create(['name' => 'Old', 'email' => 'old@example.com']);

    $this->actingAs(admin())
        ->put("/admin/users/{$user->id}", userPayload(['name' => 'New', 'email' => 'new@example.com', 'role' => User::ROLE_ADMIN]))
        ->assertSessionHas('success', 'User updated successfully.');

    $user->refresh();
    expect($user->name)->toBe('New')
        ->and($user->role)->toBe(User::ROLE_ADMIN)
        ->and(Hash::check('secret-password', $user->password))->toBeTrue();

    Log::shouldHaveReceived('info')->with('User updated', Mockery::on(fn ($context) => $context['changes'] === [
        'name' => ['from' => 'Old', 'to' => 'New'],
        'email' => ['from' => 'old@example.com', 'to' => 'new@example.com'],
        'role' => ['from' => User::ROLE_APPROVER, 'to' => User::ROLE_ADMIN],
        'password' => 'changed',
    ]));
});

test('updating a user keeps the password when none is given', function () {
    Log::spy();
    $user = User::factory()->approver()->create(['email' => 'same@example.com']);
    $originalHash = $user->password;

    $this->actingAs(admin())
        ->put("/admin/users/{$user->id}", userPayload([
            'name' => $user->name,
            'email' => 'same@example.com',
            'password' => null,
            'password_confirmation' => null,
        ]))
        ->assertSessionHasNoErrors();

    expect($user->fresh()->password)->toBe($originalHash);
    Log::shouldHaveReceived('info')->with('User updated', Mockery::on(fn ($context) => $context['changes'] === []));
});

test('a user cannot take another user\'s email', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create();

    $this->actingAs(admin())
        ->put("/admin/users/{$user->id}", userPayload(['email' => 'taken@example.com']))
        ->assertSessionHasErrors(['email' => 'A user with this email already exists.']);
});

test('admins can delete other users', function () {
    Log::spy();
    $user = User::factory()->create();

    $this->actingAs(admin())
        ->delete("/admin/users/{$user->id}")
        ->assertSessionHas('success', 'User deleted successfully.');

    expect(User::find($user->id))->toBeNull();
    Log::shouldHaveReceived('info')->with('User deleted', Mockery::any());
});

test('admins cannot delete themselves', function () {
    $admin = admin();

    $this->actingAs($admin)
        ->delete("/admin/users/{$admin->id}")
        ->assertSessionHas('error', 'You cannot delete your own account.');

    expect($admin->fresh())->not->toBeNull();
});

test('admins can send a password reset link', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->actingAs(admin())
        ->post("/admin/users/{$user->id}/reset-password")
        ->assertSessionHas('success', "Password reset link sent to {$user->email}");

    Notification::assertSentTo($user, ResetPassword::class);
});

test('sending reset links too often fails gracefully', function () {
    Notification::fake();
    Log::spy();
    $user = User::factory()->create();
    $admin = admin();

    $this->actingAs($admin)->post("/admin/users/{$user->id}/reset-password");
    $this->actingAs($admin)
        ->post("/admin/users/{$user->id}/reset-password")
        ->assertSessionHas('error', 'Failed to send password reset link. Please try again.');

    Notification::assertSentToTimes($user, ResetPassword::class, 1);
    Log::shouldHaveReceived('warning')->with('Password reset link failed', Mockery::any());
});

test('changing a user password signs out their existing sessions', function () {
    $user = approver();

    $this->actingAs($user)->get('/admin/dashboard')->assertOk();
    $otherSession = session()->all();
    $this->flushSession();

    $this->actingAs(admin())
        ->put("/admin/users/{$user->id}", userPayload(['email' => $user->email]))
        ->assertSessionHas('success');
    $this->flushSession();

    $this->withSession($otherSession)
        ->actingAs($user->refresh())
        ->get('/admin/dashboard')
        ->assertRedirect(route('login'));
    $this->assertGuest();
});
