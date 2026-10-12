<?php

use App\Models\AnalyticsSearch;
use App\Models\AnalyticsVisit;
use App\Models\Article;

test('a search is logged with normalized params, zero results included', function () {
    browse('/articles/search?title=BALANCE&keywords=Land%20%20Rights&theme=&subtheme=Leadership');

    $search = AnalyticsSearch::sole();
    expect($search->params)->toBe('{"keywords":"land rights","sub_theme_1":"Leadership","title":"balance"}')
        ->and($search->result_count)->toBe(0)
        ->and($search->visit_id)->toBe(AnalyticsVisit::sole()->id);
});

test('the result count is the total across pages', function () {
    Article::factory()->count(12)->create(['title' => 'Balance', 'isApproved' => true]);

    browse('/articles/search?title=balance');

    expect(AnalyticsSearch::sole()->result_count)->toBe(12);
});

test('later pages of the same search are not logged again', function () {
    browse('/articles/search?title=balance&page=2');

    expect(AnalyticsSearch::count())->toBe(0)->and(AnalyticsVisit::count())->toBe(1);
});

test('blank searches are not logged', function (string $uri) {
    browse($uri);

    expect(AnalyticsSearch::count())->toBe(0)->and(AnalyticsVisit::count())->toBe(1);
})->with(['/articles/search', '/articles/search?keywords=%20%20&theme=']);

test('bot searches are not logged', function () {
    browse('/articles/search?title=balance', ['User-Agent' => BOT_UA]);

    expect(AnalyticsSearch::count())->toBe(0);
});
