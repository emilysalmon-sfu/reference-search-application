<?php

use App\Models\Article;
use App\Models\Config;
use Inertia\Testing\AssertableInertia as Assert;

test('only admins can open the settings page', function () {
    $this->get('/admin/config')->assertRedirect(route('login'));

    $this->actingAs(approver())
        ->get('/admin/config')
        ->assertRedirect('/admin/dashboard')
        ->assertSessionHas('error', 'You do not have permission to access this page.');
});

test('approvers get a 403 from the settings api', function () {
    $this->actingAs(approver())
        ->putJson('/admin/config/update', ['worksheet_name' => 'Hacked'])
        ->assertForbidden()
        ->assertJson(['message' => 'Unauthorized. Admin access required.']);
});

test('the settings page shows the config and existing study types', function () {
    Article::factory()->create(['type_of_study' => 'Opinion']);
    Article::factory()->create(['type_of_study' => 'Empirical']);
    Article::factory()->create(['type_of_study' => '']);

    $this->actingAs(admin())
        ->get('/admin/config')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Config/config')
            ->where('existingTypes', ['Empirical', 'Opinion'])
            ->where('defaultTypeStyles', Config::defaultTypeStyles())
            ->where('config.type_styles', Config::defaultTypeStyles())
        );

    expect(Config::count())->toBe(1);
});

test('admins can update the import settings', function () {
    $this->actingAs(admin())
        ->put('/admin/config/update', [
            'worksheet_name' => 'Articles',
            'column_map' => ['author' => 'Writer'],
            'type_styles' => ['Opinion' => ['bg' => 'bg-red-100', 'text' => 'text-red-800']],
        ])
        ->assertSessionHas('success', 'The settings were updated successfully!');

    expect(Config::current())
        ->worksheet_name->toBe('Articles')
        ->column_map->toBe(['author' => 'Writer'])
        ->getTypeStyles()->toBe(['Opinion' => ['bg' => 'bg-red-100', 'text' => 'text-red-800']]);
});

test('invalid settings are reported as field errors', function (array $payload, string $field) {
    $this->actingAs(admin())
        ->put('/admin/config/update', $payload)
        ->assertSessionHasErrors($field)
        ->assertSessionMissing('error');

    expect(Config::current()->column_map)->toBe([]);
})->with([
    'column map not a list' => [['column_map' => 'not a list'], 'column_map'],
    'type styles not a list' => [['type_styles' => 'not a list'], 'type_styles'],
    'worksheet name not text' => [['worksheet_name' => ['a']], 'worksheet_name'],
]);

test('a failed settings save shows an error', function () {
    Config::current();
    Config::updating(fn () => throw new RuntimeException('Database is down'));

    $this->actingAs(admin())
        ->put('/admin/config/update', ['worksheet_name' => 'Articles'])
        ->assertSessionHas('error', 'There was an error updating the settings. Error: Database is down');
});
