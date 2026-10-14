<?php

use App\Models\Article;
use App\Models\ArticleExportInfo;
use App\Models\ArticleImportUpload;
use App\Models\Feedback;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('the old dashboard urls redirect to the admin dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/admin/dashboard');
    $this->actingAs(User::factory()->create())->get('/admin')->assertRedirect('/admin/dashboard');
});

test('the dashboard shows an empty state', function () {
    $this->actingAs(approver())
        ->get('/admin/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('pendingApprovalsCount', 0)
            ->where('unresolvedFeedbacksCount', 0)
            ->where('lastImportedFileDate', null)
            ->where('articlesCreated', 0)
            ->where('articlesWithoutYear', 0)
            ->where('totalArticlesCount', 0)
        );
});

test('the dashboard summarises the data', function () {
    Article::factory()->count(2)->create(['isApproved' => false]);
    Article::factory()->create(['year_published' => null]);
    Article::factory()->create(['year_published' => '']);
    Article::factory()->create(['year_published' => null, 'isApproved' => false]);
    Article::factory()->create(['year_published' => '2020']);
    Feedback::create(['name' => 'A', 'email' => 'a@example.com', 'comment' => 'Open feedback']);
    Feedback::create(['name' => 'B', 'email' => 'b@example.com', 'comment' => 'Done feedback', 'isResolved' => true]);
    ArticleImportUpload::forceCreate(['date' => '2026-01-02', 'articlesCreated' => 3, 'created_at' => now()->subDay()]);
    ArticleImportUpload::create(['date' => '2026-03-04', 'articlesCreated' => 7]);

    $this->actingAs(approver())
        ->get('/admin/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingApprovalsCount', 3)
            ->where('unresolvedFeedbacksCount', 1)
            ->where('lastImportedFileDate', '04 Mar 2026')
            ->where('articlesCreated', 7)
            ->where('articlesWithoutYear', 2)
            ->where('totalArticlesCount', 6)
        );
});

test('dashboard stats can be filtered by period', function (string $period, array $expected) {
    $this->freezeTime();

    $at = fn (string $ago) => now()->sub($ago);
    foreach (['12 hours' => 1, '3 days' => 10, '2 months' => 100, '2 years' => 1000] as $ago => $count) {
        ArticleExportInfo::create(['date' => $at($ago), 'count' => $count]);
        Article::factory()->create(['source' => Article::SOURCE_USER, 'created_at' => $at($ago)]);
        Article::factory()->create(['source' => Article::SOURCE_ADMIN, 'created_at' => $at($ago)]);
    }
    // Pending and imported articles are never counted.
    Article::factory()->create(['source' => Article::SOURCE_USER, 'isApproved' => false]);
    Article::factory()->create(['source' => Article::SOURCE_IMPORT]);

    $this->actingAs(approver())
        ->getJson("/admin/dashboard/stats?period={$period}")
        ->assertOk()
        ->assertExactJson($expected);
})->with([
    '24h' => ['24h', ['downloadsCount' => 1, 'userArticlesCount' => 1, 'adminArticlesCount' => 1]],
    '48h' => ['48h', ['downloadsCount' => 1, 'userArticlesCount' => 1, 'adminArticlesCount' => 1]],
    'week' => ['week', ['downloadsCount' => 11, 'userArticlesCount' => 2, 'adminArticlesCount' => 2]],
    'month' => ['month', ['downloadsCount' => 11, 'userArticlesCount' => 2, 'adminArticlesCount' => 2]],
    '3 months' => ['3months', ['downloadsCount' => 111, 'userArticlesCount' => 3, 'adminArticlesCount' => 3]],
    '6 months' => ['6months', ['downloadsCount' => 111, 'userArticlesCount' => 3, 'adminArticlesCount' => 3]],
    'year' => ['year', ['downloadsCount' => 111, 'userArticlesCount' => 3, 'adminArticlesCount' => 3]],
    'all' => ['all', ['downloadsCount' => 1111, 'userArticlesCount' => 4, 'adminArticlesCount' => 4]],
    'unknown' => ['forever', ['downloadsCount' => 1111, 'userArticlesCount' => 4, 'adminArticlesCount' => 4]],
]);

test('dashboard stats default to all time', function () {
    ArticleExportInfo::create(['date' => now()->subYears(5), 'count' => 4]);

    $this->actingAs(approver())
        ->getJson('/admin/dashboard/stats')
        ->assertJson(['downloadsCount' => 4]);
});
