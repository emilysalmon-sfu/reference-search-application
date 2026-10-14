<?php

use App\Exports\ArticlesExport;
use App\Models\Article;
use App\Models\ArticleExportInfo;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

beforeEach(function () {
    $this->travelTo(now()->setTimezone('America/Vancouver')->setTime(12, 0, 0));
    $this->filename = 'articles_'.now('America/Vancouver')->format('Y-m-d_H-i-s').'.xlsx';
});

test('anyone can download all articles as a spreadsheet', function () {
    Excel::fake();
    Article::factory()->count(3)->create();

    $this->get('/export')->assertOk();

    Excel::assertDownloaded($this->filename, fn (ArticlesExport $export) => $export->collection()->count() === 3);
});

test('the download never includes suggestions awaiting approval', function () {
    Excel::fake();
    Article::factory()->create(['title' => 'Published']);
    Article::factory()->create(['title' => 'Pending', 'isApproved' => false]);

    $this->get('/export')->assertOk();

    Excel::assertDownloaded($this->filename, fn (ArticlesExport $export) => $export->collection()->pluck('title')->all() === ['Published']);
});

test('the download respects each filter', function (array $query, array $match, array $miss) {
    Excel::fake();
    Article::factory()->create(array_merge(['title' => 'Match', 'year_published' => '2015'], $match));
    Article::factory()->create(array_merge(['title' => 'Miss', 'year_published' => '2015'], $miss));

    $this->get('/export?'.http_build_query($query))->assertOk();

    Excel::assertDownloaded($this->filename, fn (ArticlesExport $export) => $export->collection()->pluck('title')->all() === ['Match']);
})->with([
    'author' => [['author' => 'smith'], ['author' => 'Jane Smith'], ['author' => 'Bob Jones']],
    'title' => [['title' => 'atc'], [], []],
    'journal' => [['journal' => 'Nature'], ['journal_name' => 'Nature'], ['journal_name' => 'Science']],
    'keywords' => [['keywords' => 'burnout'], ['keywords' => ['burnout']], ['keywords' => ['pay']]],
    'abstract' => [['abstract' => 'remote'], ['abstract' => 'On remote work'], ['abstract' => 'On pay']],
    'year from' => [['year_from' => '2010'], ['year_published' => '2020'], ['year_published' => '2000']],
    'year to' => [['year_to' => '2010'], ['year_published' => '2000'], ['year_published' => '2020']],
    'theme' => [['theme' => 'Work'], ['theme' => 'Work'], ['theme' => 'Family']],
    'sub theme' => [['sub_theme_1' => 'Sleep'], ['sub_theme_1' => 'Sleep'], ['sub_theme_1' => 'Diet']],
    'country' => [['country' => 'Canada'], ['country' => 'Canada'], ['country' => 'Brazil']],
    'type of study' => [['type_of_study' => 'Opinion'], ['type_of_study' => 'Opinion'], ['type_of_study' => 'Empirical']],
    'doi' => [['doi' => '10.1000/abc'], ['doi' => '10.1000/abc'], ['doi' => '10.1000/xyz']],
]);

test('nothing to download shows an error', function () {
    Excel::fake();

    $this->get('/export?author=nobody')
        ->assertRedirect()
        ->assertSessionHas('error', 'No articles found for the selected filters.');

    expect(ArticleExportInfo::count())->toBe(0);
});

test('downloads are counted per day', function () {
    Excel::fake();
    Article::factory()->create();

    $this->get('/export');
    $this->get('/export');
    expect(ArticleExportInfo::sole()->count)->toBe(2);

    $this->travel(1)->day();
    $this->get('/export');
    expect(ArticleExportInfo::count())->toBe(2);
});

test('a failed download shows an error', function () {
    Log::spy();
    Article::factory()->create();
    Excel::shouldReceive('download')->andThrow(new RuntimeException('Disk full'));

    $this->get('/export')
        ->assertRedirect()
        ->assertSessionHas('error', 'Export failed: Disk full');

    Log::shouldHaveReceived('error')->with('File export failed', Mockery::any());
});
