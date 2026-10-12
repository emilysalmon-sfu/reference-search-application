<?php

use App\Models\Article;
use Illuminate\Support\Facades\Artisan;

function duplicateReport(): array
{
    Artisan::call('articles:duplicates');

    return array_map('str_getcsv', array_values(array_filter(explode("\n", Artisan::output()))));
}

test('it lists articles sharing a doi, then articles without a doi sharing title and year', function () {
    $a = insertLegacyArticle('10.1111/joms.13266');
    $b = insertLegacyArticle('https://doi.org/10.1111/JOMS.13266');
    Article::factory()->create(['doi' => '10.1000/unique']);
    $c = Article::factory()->create(['doi' => null, 'title' => 'Indigenous Leadership: A Review', 'year_published' => 2021]);
    $d = Article::factory()->create(['doi' => null, 'title' => 'indigenous leadership - a review ', 'year_published' => 2021]);
    Article::factory()->create(['doi' => null, 'title' => 'Indigenous Leadership: A Review', 'year_published' => 2022]);

    $rows = duplicateReport();

    expect($rows[0])->toBe(['group_type', 'group_key', 'id', 'title', 'author', 'year', 'journal', 'doi', 'approved', 'source', 'created_at'])
        ->and(array_map(fn ($r) => [$r[0], $r[1], (int) $r[2]], array_slice($rows, 1)))->toBe([
            ['doi', '10.1111/joms.13266', $a],
            ['doi', '10.1111/joms.13266', $b],
            ['title_year', 'indigenous leadership a review|2021', $c->id],
            ['title_year', 'indigenous leadership a review|2021', $d->id],
        ]);
});

test('it prints only the header when there are no duplicates and changes nothing', function () {
    Article::factory()->count(2)->create();

    expect(duplicateReport())->toHaveCount(1)
        ->and(Article::count())->toBe(2);
});
