<?php

use App\Models\Article;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot reach article management', function (string $method, string $uri) {
    $article = Article::factory()->create();

    $this->{$method}(str_replace('{id}', $article->id, $uri))->assertRedirect(route('login'));
})->with([
    ['get', '/admin/articles/new'],
    ['get', '/admin/articles/list'],
    ['get', '/admin/articles/search'],
    ['post', '/admin/articles'],
    ['put', '/admin/articles/{id}'],
    ['delete', '/admin/articles/{id}'],
]);

test('approvers can manage articles too', function () {
    $this->actingAs(approver())->get('/admin/articles/list')->assertOk();
});

test('the create article page renders', function () {
    $this->actingAs(admin())
        ->get('/admin/articles/new')
        ->assertInertia(fn (Assert $page) => $page->component('Articles/createArticle'));
});

test('the list shows all articles, newest first, with filter options', function () {
    Article::factory()->create(['title' => 'Old', 'created_at' => now()->subDay(), 'type_of_study' => 'Opinion', 'theme' => 'Work', 'sub_theme_1' => 'Pay']);
    Article::factory()->create(['title' => 'Pending', 'isApproved' => false]);

    $this->actingAs(admin())
        ->get('/admin/articles/list')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Articles/articleList')
            ->has('articles.data', 2)
            ->where('articles.data.0.title', 'Pending')
            ->where('types', ['Opinion'])
            ->where('themes', [['theme' => 'Work', 'subthemes' => ['Pay']]])
        );
});

test('the list page size can be chosen but is capped at 100', function (string $query, int $expected) {
    Article::factory()->count(3)->create();

    $this->actingAs(admin())
        ->get("/admin/articles/list{$query}")
        ->assertInertia(fn (Assert $page) => $page->where('articles.per_page', $expected));
})->with([
    'default' => ['', 15],
    'custom' => ['?per_page=2', 2],
    'capped' => ['?per_page=500', 100],
]);

test('the list still renders when the filter queries fail', function () {
    Article::factory()->create();
    failQueriesContaining('select distinct "type_of_study"', 'select "theme", "sub_theme_1"');

    $this->actingAs(admin())
        ->get('/admin/articles/list')
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 1)
            ->where('types', [])
            ->where('themes', [])
        );
});

test('admin search matches any of the given fields', function () {
    Article::factory()->create(['title' => 'By author', 'author' => 'Jane Smith']);
    Article::factory()->create(['title' => 'By journal', 'journal_name' => 'Smith Quarterly']);
    Article::factory()->create(['title' => 'By keyword', 'keywords' => ['smithing']]);
    Article::factory()->create(['title' => 'Smith in title']);
    Article::factory()->create(['title' => 'Unrelated', 'author' => 'Bob', 'journal_name' => 'Nature', 'keywords' => ['pay']]);

    $this->actingAs(admin())
        ->get('/admin/articles/search?'.http_build_query([
            'author' => 'Smith', 'title' => 'Smith', 'journal' => 'Smith', 'keywords' => 'smith',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Articles/articleList')
            ->has('articles.data', 4)
            ->where('articles.data', fn ($data) => ! collect($data)->contains('title', 'Unrelated'))
        );
});

test('admin search without filters returns everything, with filter options', function () {
    Article::factory()->count(2)->create();
    Article::factory()->create(['type_of_study' => 'Opinion', 'theme' => 'Work', 'sub_theme_1' => 'Pay']);

    $this->actingAs(admin())
        ->get('/admin/articles/search?author=&title=')
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 3)
            ->where('types', ['Opinion'])
            ->where('themes', [['theme' => 'Work', 'subthemes' => ['Pay']]])
        );
});

test('admin search can list articles missing a year', function () {
    Article::factory()->create(['title' => 'No year', 'year_published' => null]);
    Article::factory()->create(['title' => 'Empty year', 'year_published' => '']);
    Article::factory()->create(['title' => 'Has year', 'year_published' => '2020']);

    $this->actingAs(admin())
        ->get('/admin/articles/search?missing_year=1&per_page=500')
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 2)
            ->where('articles.per_page', 100)
        );
});

test('admin search still renders when the database fails', function () {
    failQueriesContaining('from "articles"');

    $this->actingAs(admin())
        ->get('/admin/articles/search')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('articles', [])
            ->where('types', [])
            ->where('themes', [])
        );
});

test('admins can add an approved article', function () {
    $this->actingAs(admin())
        ->post('/admin/articles', articlePayload([
            'keywords' => 'pay; hours',
            'theme' => 'Work',
            'sub_theme_1' => 'Pay',
            'country' => 'Canada',
            'type_of_study' => 'Empirical',
        ]))
        ->assertSessionHas('success', 'Article created successfully.');

    $article = Article::sole();

    expect($article->isApproved)->toBeTruthy()
        ->and($article->source)->toBe(Article::SOURCE_ADMIN)
        ->and($article->keywords)->toBe(['pay', 'hours'])
        ->and($article->country)->toBe('Canada');
});

test('adding an article is validated', function (array $payload, string $field) {
    $this->actingAs(admin())->post('/admin/articles', $payload)->assertSessionHasErrors($field);
})->with([
    'missing author' => [articlePayload(['author' => '']), 'author'],
    'missing title' => [articlePayload(['title' => '']), 'title'],
    'missing journal' => [articlePayload(['journal_name' => '']), 'journal_name'],
    'bad year' => [articlePayload(['year_published' => 'n.d.']), 'year_published'],
    'two-digit year' => [articlePayload(['year_published' => '20']), 'year_published'],
    'five-digit year' => [articlePayload(['year_published' => '20201']), 'year_published'],
    'theme too long' => [articlePayload(['theme' => str_repeat('a', 256)]), 'theme'],
]);

test('the year is optional when adding an article as admin', function () {
    $this->actingAs(admin())
        ->post('/admin/articles', articlePayload(['year_published' => null]))
        ->assertSessionHasNoErrors();

    expect(Article::sole()->year_published)->toBeNull();
});

test('a failed admin save shows an error', function () {
    Article::creating(fn () => throw new RuntimeException('Database is down'));

    $this->actingAs(admin())
        ->post('/admin/articles', articlePayload())
        ->assertSessionHas('error', 'An error occurred while creating the article.');
});

test('admins can edit an article', function () {
    $article = Article::factory()->create(['title' => 'Old title']);

    $this->actingAs(admin())
        ->put("/admin/articles/{$article->id}", articlePayload(['title' => 'New title', 'keywords' => 'a, b']))
        ->assertSessionHas('success', 'Article updated successfully.');

    expect($article->fresh())
        ->title->toBe('New title')
        ->keywords->toBe(['a', 'b']);
});

test('a failed edit shows an error', function () {
    $article = Article::factory()->create();
    Article::updating(fn () => throw new RuntimeException('Database is down'));

    $this->actingAs(admin())
        ->put("/admin/articles/{$article->id}", articlePayload(['title' => 'New title']))
        ->assertSessionHas('error', 'An error occurred while updating the article.');
});

test('admins can delete an article', function () {
    $article = Article::factory()->create();

    $this->actingAs(admin())
        ->delete("/admin/articles/{$article->id}")
        ->assertSessionHas('success', 'Article deleted successfully.');

    expect(Article::count())->toBe(0);
});

test('a failed delete shows an error', function () {
    $article = Article::factory()->create();
    Article::deleting(fn () => throw new RuntimeException('Database is down'));

    $this->actingAs(admin())
        ->delete("/admin/articles/{$article->id}")
        ->assertSessionHas('error', 'An error occurred while deleting the article.');

    expect(Article::count())->toBe(1);
});

test('editing or deleting a missing article is a 404', function () {
    $this->actingAs(User::factory()->create());

    $this->put('/admin/articles/999', articlePayload())->assertNotFound();
    $this->delete('/admin/articles/999')->assertNotFound();
});
