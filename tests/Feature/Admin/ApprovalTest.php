<?php

use App\Models\Article;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot reach approvals', function () {
    $this->get('/admin/approvals')->assertRedirect(route('login'));
});

test('the approvals page lists only pending articles, newest first', function () {
    Article::factory()->create(['title' => 'Published']);
    Article::factory()->create(['title' => 'Older pending', 'isApproved' => false, 'created_at' => now()->subDay()]);
    Article::factory()->create(['title' => 'Newer pending', 'isApproved' => false, 'type_of_study' => 'Opinion', 'theme' => 'Work']);

    $this->actingAs(approver())
        ->get('/admin/approvals')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Approvals/approvals')
            ->has('articles.data', 2)
            ->where('articles.data.0.title', 'Newer pending')
            ->where('articles.data.1.title', 'Older pending')
            ->where('types', ['Opinion'])
            ->where('themes', [['theme' => 'Work', 'subthemes' => []]])
        );
});

test('the approvals page still renders when the filter queries fail', function () {
    failQueriesContaining('select distinct "type_of_study"', 'select "theme", "sub_theme_1"');

    $this->actingAs(approver())
        ->get('/admin/approvals')
        ->assertInertia(fn (Assert $page) => $page->where('types', [])->where('themes', []));
});

test('approving publishes the article with the reviewer\'s edits', function () {
    $article = Article::factory()->create(['isApproved' => false, 'title' => 'Typo titel']);

    $this->actingAs(approver())
        ->put("/admin/approvals/{$article->id}/approve", articlePayload([
            'title' => 'Fixed title',
            'theme' => 'Work',
            'keywords' => 'pay, hours',
        ]))
        ->assertSessionHas('success', 'Article approved successfully.');

    expect($article->fresh())
        ->isApproved->toBeTruthy()
        ->title->toBe('Fixed title')
        ->theme->toBe('Work');
});

test('approving is validated', function (array $payload, string $field) {
    $article = Article::factory()->create(['isApproved' => false]);

    $this->actingAs(approver())
        ->put("/admin/approvals/{$article->id}/approve", $payload)
        ->assertSessionHasErrors($field);

    expect($article->fresh()->isApproved)->toBeFalsy();
})->with([
    'missing author' => [articlePayload(['author' => '']), 'author'],
    'author too long' => [articlePayload(['author' => str_repeat('a', 513)]), 'author'],
    'missing title' => [articlePayload(['title' => '']), 'title'],
    'missing journal' => [articlePayload(['journal_name' => '']), 'journal_name'],
    'bad year' => [articlePayload(['year_published' => 'n.d.']), 'year_published'],
    'two-digit year' => [articlePayload(['year_published' => '20']), 'year_published'],
    'five-digit year' => [articlePayload(['year_published' => '20201']), 'year_published'],
]);

test('a suggestion can be approved without a year (shown as Forthcoming)', function () {
    $article = Article::factory()->create(['isApproved' => false]);

    $this->actingAs(approver())
        ->put("/admin/approvals/{$article->id}/approve", articlePayload(['year_published' => '']))
        ->assertSessionHasNoErrors();

    expect($article->fresh())
        ->isApproved->toBeTruthy()
        ->year_published->toBeNull();
});

test('a failed approval shows an error', function () {
    $article = Article::factory()->create(['isApproved' => false]);
    Article::updating(fn () => throw new RuntimeException('Database is down'));

    $this->actingAs(approver())
        ->put("/admin/approvals/{$article->id}/approve", articlePayload())
        ->assertSessionHas('error', 'An error occurred while approving the article.');
});

test('rejecting removes the suggestion', function () {
    $article = Article::factory()->create(['isApproved' => false]);

    $this->actingAs(approver())
        ->delete("/admin/approvals/{$article->id}/reject")
        ->assertSessionHas('success', 'Article rejected and removed.');

    expect(Article::count())->toBe(0);
});

test('a failed rejection shows an error', function () {
    $article = Article::factory()->create(['isApproved' => false]);
    Article::deleting(fn () => throw new RuntimeException('Database is down'));

    $this->actingAs(approver())
        ->delete("/admin/approvals/{$article->id}/reject")
        ->assertSessionHas('error', 'An error occurred while rejecting the article.');

    expect(Article::count())->toBe(1);
});
