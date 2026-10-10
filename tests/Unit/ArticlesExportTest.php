<?php

use App\Exports\ArticlesExport;
use Illuminate\Support\Collection;

function exportRow(array $attributes): array
{
    $article = (object) array_merge(array_fill_keys([
        'author', 'title', 'year_published', 'journal_name', 'abstract', 'doi',
        'keywords', 'theme', 'sub_theme_1', 'country', 'type_of_study',
    ], null), $attributes);

    return (new ArticlesExport(collect()))->map($article);
}

test('it exports the given articles with headings', function () {
    $articles = collect([(object) ['title' => 'A']]);
    $export = new ArticlesExport($articles);

    expect($export->collection())->toBe($articles)
        ->and($export->headings())->toBe([
            'Author', 'Title', 'Year Published', 'Journal', 'Abstract', 'DOI',
            'Keywords', 'Theme', 'Sub Theme 1', 'Country', 'Type of Study',
        ]);
});

test('it maps an article to one row in heading order', function () {
    expect(exportRow([
        'author' => 'Smith, J.',
        'title' => 'Title',
        'year_published' => 2020,
        'journal_name' => 'Journal',
        'abstract' => 'Abstract',
        'doi' => '10.1000/abc',
        'keywords' => ['stress', 'sleep'],
        'theme' => 'Work',
        'sub_theme_1' => 'Hours',
        'country' => 'Canada',
        'type_of_study' => 'Empirical',
    ]))->toBe([
        'Smith, J.', 'Title', '2020', 'Journal', 'Abstract', 'https://doi.org/10.1000/abc',
        'stress; sleep', 'Work', 'Hours', 'Canada', 'Empirical',
    ]);
});

test('empty values become empty cells', function () {
    expect(exportRow([]))->toBe(array_fill(0, 11, ''));
});

test('values are converted to text', function (mixed $keywords, string $expected) {
    expect(exportRow(['keywords' => $keywords])[6])->toBe($expected);
})->with([
    'list' => [['a', 'b'], 'a; b'],
    'keyed array' => [['first' => 'a'], '{"first":"a"}'],
    'collection list' => [new Collection(['a', 'b']), 'a; b'],
    'keyed collection' => [new Collection(['first' => 'a']), '{"first":"a"}'],
    'stringable' => [str('plain'), 'plain'],
    'plain object' => [(object) ['first' => 'a'], '{"first":"a"}'],
]);

test('cells that look like formulas are escaped', function (string $value) {
    expect(exportRow(['title' => $value])[1])->toBe("'".$value);
})->with(['=SUM(A1:A2)', '+1', '-1', '@cmd']);
