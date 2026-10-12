<?php

use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

test('admins see the usage page for the requested range', function () {
    $this->actingAs(admin())
        ->get('/admin/usage?from=2026-10-01&to=2026-10-10')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Usage/index')
            ->where('report.from', '2026-10-01')
            ->where('report.to', '2026-10-10')
            ->has('report.summary', 6)
        );
});

test('the default range is the last 30 days', function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-12 08:00', 'America/Vancouver'));

    $this->actingAs(admin())
        ->get('/admin/usage')
        ->assertInertia(fn (Assert $page) => $page
            ->where('report.from', '2026-09-13')
            ->where('report.to', '2026-10-12')
        );
});

test('an inverted range is rejected', function () {
    $this->actingAs(admin())
        ->get('/admin/usage?from=2026-10-10&to=2026-10-01')
        ->assertSessionHasErrors('to');
});

test('approvers and guests cannot see usage', function () {
    $this->get('/admin/usage')->assertRedirect(route('login'));

    $this->actingAs(approver())->get('/admin/usage')->assertRedirect('/admin/dashboard');
});
