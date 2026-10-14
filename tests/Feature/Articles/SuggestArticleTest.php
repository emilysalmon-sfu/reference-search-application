<?php

use App\Models\Article;

test('visitors can suggest an article, which waits for approval', function () {
    $this->post('/articles', articlePayload([
        'keywords' => "stress, burnout;\nsleep, stress",
        'abstract' => 'An abstract.',
        'doi' => '10.1000/abc',
    ]))
        ->assertRedirect()
        ->assertSessionHas('success');

    $article = Article::sole();

    expect($article->isApproved)->toBeFalsy()
        ->and($article->source)->toBe(Article::SOURCE_USER)
        ->and($article->keywords)->toBe(['stress', 'burnout', 'sleep'])
        ->and($article->title)->toBe('A study on balance');
});

test('suggestions are validated', function (array $payload, string $field) {
    $this->post('/articles', $payload)->assertSessionHasErrors($field);

    expect(Article::count())->toBe(0);
})->with([
    'missing author' => [articlePayload(['author' => '']), 'author'],
    'author too long' => [articlePayload(['author' => str_repeat('a', 256)]), 'author'],
    'missing title' => [articlePayload(['title' => '']), 'title'],
    'missing year' => [articlePayload(['year_published' => '']), 'year_published'],
    'year not a year' => [articlePayload(['year_published' => 'n.d.']), 'year_published'],
    'two-digit year' => [articlePayload(['year_published' => '20']), 'year_published'],
    'five-digit year' => [articlePayload(['year_published' => '20201']), 'year_published'],
    'missing journal' => [articlePayload(['journal_name' => '']), 'journal_name'],
]);

test('a failed save shows an error instead of crashing', function () {
    Article::creating(fn () => throw new RuntimeException('Database is down'));

    $this->post('/articles', articlePayload())
        ->assertRedirect()
        ->assertSessionHas('error', 'An error occurred while submitting the article for approval.');
});
