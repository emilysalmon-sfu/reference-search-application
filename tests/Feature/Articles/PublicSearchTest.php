<?php

use App\Models\Article;
use Inertia\Testing\AssertableInertia as Assert;

test('the home page lists study types and themes for the filters', function () {
    Article::factory()->create(['type_of_study' => 'Opinion', 'theme' => 'Work', 'sub_theme_1' => 'Hours']);
    Article::factory()->create(['type_of_study' => 'Empirical', 'theme' => 'Work', 'sub_theme_1' => 'Pay']);
    Article::factory()->create(['type_of_study' => 'Empirical', 'theme' => 'Work', 'sub_theme_1' => 'Hours']);
    Article::factory()->create(['type_of_study' => '', 'theme' => 'Family', 'sub_theme_1' => null]);
    Article::factory()->create(['type_of_study' => null, 'theme' => '']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles')
            ->where('types', ['Empirical', 'Opinion'])
            ->where('themes', [
                ['theme' => 'Family', 'subthemes' => []],
                ['theme' => 'Work', 'subthemes' => ['Hours', 'Pay']],
            ])
        );
});

test('the home page still renders when the filter queries fail', function () {
    failQueriesContaining('from "articles"');

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('types', [])->where('themes', []));
});

test('search only returns approved articles, ordered by year', function () {
    Article::factory()->create(['title' => 'Newer', 'year_published' => '2021']);
    Article::factory()->create(['title' => 'Older', 'year_published' => '2001']);
    Article::factory()->create(['title' => 'Pending', 'isApproved' => false]);

    $this->get('/articles/search')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles')
            ->where('totalArticleCount', 2)
            ->where('articles.data.0.title', 'Older')
            ->where('articles.data.1.title', 'Newer')
        );
});

test('search filters by each field', function (string $param, string $value, array $match, array $miss) {
    Article::factory()->create(array_merge(['title' => 'Match'], $match));
    Article::factory()->create(array_merge(['title' => 'Miss'], $miss));

    $this->get('/articles/search?'.http_build_query([$param => $value]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('totalArticleCount', 1)
            ->where('articles.data.0.title', 'Match')
        );
})->with([
    'author' => ['author', 'smith', ['author' => 'Jane Smith'], ['author' => 'Bob Jones']],
    'title' => ['title', 'atc', [], []],
    'journal' => ['journal', 'Nature', ['journal_name' => 'Nature Reviews'], ['journal_name' => 'Science']],
    'country' => ['country', 'Canada', ['country' => 'Canada'], ['country' => 'Brazil']],
    'type of study' => ['type_of_study', 'Empirical', ['type_of_study' => 'Empirical'], ['type_of_study' => 'Opinion']],
    'keywords' => ['keywords', 'burnout', ['keywords' => ['stress', 'burnout']], ['keywords' => ['pay']]],
    'abstract' => ['abstract', 'remote work', ['abstract' => 'On remote work.'], ['abstract' => 'On pay.']],
    'theme' => ['theme', 'Wellbeing', ['theme' => 'Wellbeing'], ['theme' => 'Careers']],
    'sub theme' => ['sub_theme_1', 'Sleep', ['sub_theme_1' => 'Sleep'], ['sub_theme_1' => 'Diet']],
    'subtheme alias' => ['subtheme', 'Sleep', ['sub_theme_1' => 'Sleep'], ['sub_theme_1' => 'Diet']],
]);

test('search filters by year range', function (array $query, array $expectedTitles) {
    foreach (['2000', '2010', '2020'] as $year) {
        Article::factory()->create(['title' => $year, 'year_published' => $year]);
    }

    $this->get('/articles/search?'.http_build_query($query))
        ->assertInertia(fn (Assert $page) => $page
            ->where('totalArticleCount', count($expectedTitles))
            ->where('articles.data', fn ($data) => collect($data)->pluck('title')->all() === $expectedTitles)
        );
})->with([
    'from and to' => [['year_from' => '2005', 'year_to' => '2015'], ['2010']],
    'from only' => [['year_from' => '2010'], ['2010', '2020']],
    'to only' => [['year_to' => '2010'], ['2000', '2010']],
]);

test('search results are paginated by 10', function () {
    Article::factory()->count(12)->create();

    $this->get('/articles/search')
        ->assertInertia(fn (Assert $page) => $page
            ->where('totalArticleCount', 12)
            ->has('articles.data', 10)
            ->where('articles.last_page', 2)
        );
});

test('search echoes the filters back to the page', function () {
    $this->get('/articles/search?author=Smith&subtheme=Sleep')
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.author', 'Smith')
            ->where('filters.sub_theme_1', 'Sleep')
        );
});

test('search rejects overly long filters', function () {
    $this->get('/articles/search?author='.str_repeat('a', 256))
        ->assertSessionHasErrors('author');
});

test('search still renders when the database fails', function () {
    failQueriesContaining('from "articles"');

    $this->get('/articles/search')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('totalArticleCount', 0)
            ->where('articles', null)
            ->where('types', [])
            ->where('themes', [])
        );
});

test('journal autocomplete needs at least two characters', function () {
    Article::factory()->create(['journal_name' => 'Nature']);

    $this->getJson('/articles/journals/search?q=N')->assertExactJson([]);
});

test('journal autocomplete lists distinct matches, prefix matches first', function () {
    Article::factory()->create(['journal_name' => 'Applied Nature']);
    Article::factory()->create(['journal_name' => 'Nature']);
    Article::factory()->create(['journal_name' => 'Nature']);
    Article::factory()->create(['journal_name' => 'Science']);
    Article::factory()->create(['journal_name' => '']);

    $this->getJson('/articles/journals/search?q=nat')
        ->assertExactJson(['Nature', 'Applied Nature']);
});

test('journal autocomplete returns at most 15 names', function () {
    foreach (range(1, 20) as $i) {
        Article::factory()->create(['journal_name' => "Journal {$i}"]);
    }

    $this->getJson('/articles/journals/search?q=Journal')->assertJsonCount(15);
});

test('journal autocomplete returns nothing when the database fails', function () {
    Article::factory()->create(['journal_name' => 'Nature']);
    failQueriesContaining('from "articles"');

    $this->getJson('/articles/journals/search?q=Nature')->assertExactJson([]);
});
