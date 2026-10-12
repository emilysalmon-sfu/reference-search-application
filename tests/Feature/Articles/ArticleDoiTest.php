<?php

use App\Models\Article;
use App\Models\User;
use App\Rules\UniqueDoi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/** Inserts a row directly, bypassing the model's DOI normalization. */
function insertLegacyArticle(string $doi, bool $approved = true): int
{
    return DB::table('articles')->insertGetId([
        'author' => 'Legacy, A.',
        'title' => 'Legacy title',
        'journal_name' => 'Old Journal',
        'doi' => $doi,
        'isApproved' => $approved,
    ]);
}

test('dois are normalized', function (?string $input, ?string $expected) {
    expect(Article::normalizeDoi($input))->toBe($expected);
})->with([
    'bare' => ['10.1000/xyz123', '10.1000/xyz123'],
    'https url' => ['https://doi.org/10.1000/XYZ123', '10.1000/xyz123'],
    'http dx url' => ['http://dx.doi.org/10.1000/xyz123', '10.1000/xyz123'],
    'www url' => ['https://www.doi.org/10.1000/xyz123', '10.1000/xyz123'],
    'no scheme' => ['doi.org/10.1000/xyz123', '10.1000/xyz123'],
    'doi: prefix' => ['DOI: 10.1000/xyz123', '10.1000/xyz123'],
    'whitespace' => ["  10.1000/xyz123 \n", '10.1000/xyz123'],
    'blank' => ['   ', null],
    'null' => [null, null],
    'excel error' => ['#REF!', null],
    'n/a' => ['N/A', null],
    'free text' => ['not on doi.org yet', null],
    'corrupted live value' => ['10.1002/cjas.70076Digital Object Identifier (DOI)', '10.1002/cjas.70076'],
    'trailing words' => ['10.1111/joms.13266 (accessed 2024)', '10.1111/joms.13266'],
    'uppercase with prefix' => ['DOI: 10.1111/JOMS.13266', '10.1111/joms.13266'],
    'no suffix' => ['10.1000/', null],
    'no slash' => ['10.1000', null],
    'short registrant' => ['10.12/abc', null],
]);

test('the model stores dois in normalized form', function () {
    $article = Article::factory()->create(['doi' => ' https://dx.doi.org/10.1000/ABC ']);
    $blank = Article::factory()->create(['doi' => '']);

    expect($article->fresh()->doi)->toBe('10.1000/abc')
        ->and($blank->fresh()->doi)->toBeNull();
});

test('forms reject a doi that is not a doi', function (string $doi) {
    $this->actingAs(User::factory()->create())
        ->post('/admin/articles', articlePayload(['doi' => $doi]))
        ->assertSessionHasErrors(['doi' => 'This is not a valid DOI.']);

    $this->post('/articles', articlePayload(['doi' => $doi]))
        ->assertSessionHasErrors(['doi' => 'This is not a valid DOI.']);

    expect(Article::count())->toBe(0);
})->with(['#REF!', 'N/A']);

test('admins can create an article with a new doi', function () {
    $this->actingAs(User::factory()->create())
        ->post('/admin/articles', articlePayload(['doi' => 'https://doi.org/10.1000/NEW']))
        ->assertSessionHasNoErrors();

    expect(Article::where('doi', '10.1000/new')->exists())->toBeTrue();
});

test('admins cannot create an article with an existing doi in any format', function () {
    Article::factory()->create(['doi' => '10.1000/abc']);

    $this->actingAs(User::factory()->create())
        ->post('/admin/articles', articlePayload(['doi' => 'https://doi.org/10.1000/ABC']))
        ->assertSessionHasErrors(['doi' => 'An article with this DOI already exists.']);

    expect(Article::count())->toBe(1);
});

test('articles without a doi are never treated as duplicates', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/admin/articles', articlePayload(['doi' => '']))->assertSessionHasNoErrors();
    $this->actingAs($user)->post('/admin/articles', articlePayload(['doi' => null]))->assertSessionHasNoErrors();

    expect(Article::whereNull('doi')->count())->toBe(2);
});

test('public suggestions with an existing doi are rejected', function () {
    Article::factory()->create(['doi' => '10.1000/abc']);

    $this->post('/articles', articlePayload(['doi' => 'https://doi.org/10.1000/ABC']))
        ->assertSessionHasErrors(['doi' => 'An article with this DOI already exists.']);

    expect(Article::count())->toBe(1);
});

test('public suggestions with a doi already awaiting approval are rejected', function () {
    Article::factory()->create(['doi' => '10.1000/abc', 'isApproved' => false]);

    $this->post('/articles', articlePayload(['doi' => '10.1000/abc']))
        ->assertSessionHasErrors(['doi' => 'An article with this DOI is already awaiting approval.']);
});

test('an article can be updated while keeping its own doi', function () {
    $article = Article::factory()->create(['doi' => '10.1000/abc']);

    $this->actingAs(User::factory()->create())
        ->put("/admin/articles/{$article->id}", articlePayload(['doi' => 'https://doi.org/10.1000/ABC', 'title' => 'Renamed']))
        ->assertSessionHasNoErrors();

    expect($article->fresh()->title)->toBe('Renamed');
});

test('an article cannot be updated to another article\'s doi', function () {
    Article::factory()->create(['doi' => '10.1000/taken']);
    $article = Article::factory()->create(['doi' => '10.1000/mine']);

    $this->actingAs(User::factory()->create())
        ->put("/admin/articles/{$article->id}", articlePayload(['doi' => '10.1000/TAKEN']))
        ->assertSessionHasErrors('doi');

    expect($article->fresh()->doi)->toBe('10.1000/mine');
});

test('a suggestion cannot be approved with a published article\'s doi', function () {
    Article::factory()->create(['doi' => '10.1000/abc']);
    $pending = Article::factory()->create(['doi' => '10.1000/pending', 'isApproved' => false]);

    $this->actingAs(User::factory()->create())
        ->put("/admin/approvals/{$pending->id}/approve", articlePayload(['doi' => '10.1000/abc', 'keywords' => '']))
        ->assertSessionHasErrors(['doi' => 'An article with this DOI already exists.']);

    expect($pending->fresh()->isApproved)->toBeFalsy();
});

test('a suggestion with a unique doi can be approved', function () {
    $pending = Article::factory()->create(['doi' => '10.1000/abc', 'isApproved' => false]);

    $this->actingAs(User::factory()->create())
        ->put("/admin/approvals/{$pending->id}/approve", articlePayload(['doi' => 'https://doi.org/10.1000/abc', 'keywords' => '']))
        ->assertSessionHasNoErrors();

    expect($pending->fresh()->isApproved)->toBeTruthy();
});

test('the unique doi rule ignores blank values', function (?string $value) {
    Article::factory()->create(['doi' => null]);

    $validator = Validator::make(['doi' => $value], ['doi' => [new UniqueDoi]]);

    expect($validator->passes())->toBeTrue();
})->with(['empty' => [''], 'spaces' => ['   '], 'null' => [null]]);

test('the doi migration normalizes existing dois without adding a unique index', function () {
    $migration = require database_path('migrations/2026_10_09_000000_normalize_article_dois.php');

    $url = insertLegacyArticle('https://doi.org/10.1000/ABC');
    $blank = insertLegacyArticle('   ');
    $corrupted = insertLegacyArticle('10.1002/cjas.70076Digital Object Identifier (DOI)');
    $duplicate = insertLegacyArticle('10.1000/abc');

    $migration->up();

    expect(DB::table('articles')->orderBy('id')->pluck('doi', 'id')->all())->toBe([
        $url => '10.1000/abc',
        $blank => null,
        $corrupted => '10.1002/cjas.70076',
        $duplicate => '10.1000/abc',
    ]);
});
