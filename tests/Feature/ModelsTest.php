<?php

use App\Models\Config;
use App\Models\Feedback;
use App\Models\User;

test('user roles', function () {
    $admin = User::factory()->admin()->make();
    $approver = User::factory()->approver()->make();

    expect($admin->isAdmin())->toBeTrue()
        ->and($admin->isApprover())->toBeFalse()
        ->and($admin->canAccessAdminResources())->toBeTrue()
        ->and($approver->isAdmin())->toBeFalse()
        ->and($approver->isApprover())->toBeTrue()
        ->and($approver->canAccessAdminResources())->toBeFalse();
});

test('there is only ever one config row', function () {
    $first = Config::current();
    $second = Config::current();

    expect($second->id)->toBe($first->id)
        ->and(Config::count())->toBe(1)
        ->and($first->column_map)->toBe([])
        ->and($first->getTypeStyles())->toBe(Config::defaultTypeStyles());
});

test('a config without type styles has none', function () {
    expect((new Config)->getTypeStyles())->toBe([]);
});

test('feedback can be scoped by status', function () {
    $open = Feedback::create(['name' => 'A', 'email' => 'a@example.com', 'comment' => 'Open one']);
    $done = Feedback::create(['name' => 'B', 'email' => 'b@example.com', 'comment' => 'Done one', 'isResolved' => true]);

    expect(Feedback::pending()->pluck('id')->all())->toBe([$open->id])
        ->and(Feedback::resolved()->pluck('id')->all())->toBe([$done->id]);
});
