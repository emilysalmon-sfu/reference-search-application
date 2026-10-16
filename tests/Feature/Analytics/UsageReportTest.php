<?php

use App\Analytics\UsageReport;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsVisit;
use App\Models\ArticleExportInfo;
use Carbon\CarbonImmutable;

function vancouver(string $local): CarbonImmutable
{
    return CarbonImmutable::parse($local, 'America/Vancouver')->utc();
}

function seedVisit(array $attributes = []): AnalyticsVisit
{
    $startedAt = $attributes['started_at'] ?? vancouver('2026-10-01 12:00');

    return AnalyticsVisit::create([
        'visitor_hash' => str_repeat('a', 64),
        'source_type' => 'direct',
        'device_type' => 'desktop',
        'landing_path' => '/',
        'last_seen_at' => $startedAt,
        ...$attributes,
        'started_at' => $startedAt,
    ]);
}

function seedSearch(string $params, int $count, CarbonImmutable $at): void
{
    AnalyticsSearch::create(['params' => $params, 'result_count' => $count, 'searched_at' => $at]);
}

test('summary compares the range with the previous period of equal length', function () {
    seedVisit(['started_at' => vancouver('2026-10-01 00:00'), 'country_code' => 'CA']);
    seedVisit(['started_at' => vancouver('2026-10-10 23:59'), 'country_code' => 'FR']);
    seedVisit(['started_at' => vancouver('2026-10-11 00:00')]);
    seedVisit(['started_at' => vancouver('2026-09-21 00:00'), 'country_code' => 'CA']);
    seedVisit(['started_at' => vancouver('2026-09-20 23:59')]);
    seedSearch('{"keywords":"land"}', 4, vancouver('2026-10-02 10:00'));
    seedSearch('{"keywords":"salmon"}', 0, vancouver('2026-10-03 10:00'));
    seedSearch('{"theme":"X"}', 2, vancouver('2026-10-04 10:00'));
    ArticleExportInfo::create(['date' => '2026-10-05', 'count' => 4]);
    ArticleExportInfo::create(['date' => '2026-09-25', 'count' => 2]);

    $report = UsageReport::forRange('2026-10-01', '2026-10-10')->toArray();
    $summary = collect($report['summary'])->keyBy('key');

    expect([$report['previous_from'], $report['previous_to']])->toBe(['2026-09-21', '2026-09-30'])
        ->and($summary->keys()->all())->toBe(['visits', 'searches', 'searches_per_visit', 'zero_result_searches', 'downloads', 'countries'])
        ->and($summary['visits'])->toMatchArray(['metric' => 'Visits', 'current' => 2, 'previous' => 1, 'change' => 100])
        ->and($summary['searches'])->toMatchArray(['current' => 3, 'previous' => 0, 'change' => null])
        ->and($summary['searches_per_visit'])->toMatchArray(['current' => 1.5, 'previous' => 0.0])
        ->and($summary['zero_result_searches']['current'])->toBe(1)
        ->and($summary['downloads'])->toMatchArray(['current' => 4, 'previous' => 2, 'change' => 100])
        ->and($summary['countries'])->toMatchArray(['metric' => 'Countries reached', 'current' => 2, 'previous' => 1, 'change' => 100]);
});

test('range boundaries follow vancouver dates and single-day ranges work', function () {
    seedVisit(['started_at' => CarbonImmutable::parse('2026-10-12 06:30', 'UTC')]); // 2026-10-11 23:30 in Vancouver

    $visits = fn (string $day) => collect(UsageReport::forRange($day, $day)->toArray()['summary'])->firstWhere('key', 'visits')['current'];

    expect($visits('2026-10-11'))->toBe(1)
        ->and($visits('2026-10-12'))->toBe(0);
});

test('daily series include empty days', function () {
    seedVisit(['started_at' => vancouver('2026-10-01 12:00')]);
    seedSearch('{"title":"a"}', 1, vancouver('2026-10-03 23:00'));

    $report = UsageReport::forRange('2026-10-01', '2026-10-03')->toArray();

    expect($report['visits_over_time'])->toBe([
        ['date' => '2026-10-01', 'visits' => 1], ['date' => '2026-10-02', 'visits' => 0], ['date' => '2026-10-03', 'visits' => 0],
    ])->and($report['searches_over_time'])->toBe([
        ['date' => '2026-10-01', 'searches' => 0], ['date' => '2026-10-02', 'searches' => 0], ['date' => '2026-10-03', 'searches' => 1],
    ]);
});

test('location, sources and devices are broken down', function () {
    seedVisit(['country_code' => 'CA', 'region' => 'North America', 'source_type' => 'search', 'source_host' => 'google.com']);
    seedVisit(['country_code' => 'CA', 'region' => 'North America', 'device_type' => 'tablet', 'source_type' => 'campaign', 'utm_source' => 'newsletter', 'utm_medium' => 'email', 'utm_campaign' => 'fall']);
    seedVisit(['country_code' => 'FR', 'region' => 'Europe', 'device_type' => 'mobile']);
    seedVisit();

    $r = UsageReport::forRange('2026-10-01', '2026-10-01')->toArray();

    expect($r['regions'])->toBe([['region' => 'North America', 'visits' => 2], ['region' => 'Europe', 'visits' => 1], ['region' => 'Unknown', 'visits' => 1]])
        ->and($r['countries'])->toBe([['country_code' => 'CA', 'visits' => 2], ['country_code' => 'FR', 'visits' => 1]])
        ->and($r['source_types'])->toBe([['source_type' => 'direct', 'visits' => 2], ['source_type' => 'search', 'visits' => 1], ['source_type' => 'campaign', 'visits' => 1]])
        ->and($r['referrers'])->toBe([['host' => 'google.com', 'visits' => 1]])
        ->and($r['campaigns'])->toBe([['utm_source' => 'newsletter', 'utm_medium' => 'email', 'utm_campaign' => 'fall', 'visits' => 1]])
        ->and($r['devices'])->toBe([['device' => 'desktop', 'visits' => 2], ['device' => 'mobile', 'visits' => 2]]);
});

test('parameters are counted and zero-result searches are grouped', function () {
    seedSearch('{"theme":"X"}', 3, vancouver('2026-10-01 09:00'));
    seedSearch('{"keywords":"land","theme":"X"}', 1, vancouver('2026-10-01 09:30'));
    seedSearch('{"keywords":"salmon"}', 0, vancouver('2026-10-01 10:00'));
    seedSearch('{"keywords":"salmon"}', 0, vancouver('2026-10-05 10:00'));
    seedSearch('{"keywords":"salmon"}', 3, vancouver('2026-10-06 10:00'));

    $r = UsageReport::forRange('2026-10-01', '2026-10-10')->toArray();

    expect($r['parameters'])->toBe([
        ['parameter' => 'keywords', 'label' => 'Keywords', 'value' => 'salmon', 'count' => 3],
        ['parameter' => 'keywords', 'label' => 'Keywords', 'value' => 'land', 'count' => 1],
        ['parameter' => 'theme', 'label' => 'Theme', 'value' => 'X', 'count' => 2],
    ])->and($r['zero_result_searches'])->toBe([
        [
            'filters' => [['label' => 'Keywords', 'value' => 'salmon']],
            'url' => '/articles/search?keywords=salmon',
            'count' => 2,
            'last_searched' => '2026-10-05 10:00',
        ],
    ]);
});

test('no-result searches use the search form labels and order, with a link to rerun them', function () {
    seedSearch('{"sub_theme_1":"University Administration","theme":"Academic Implications","type_of_study":"Meta Analysis"}', 0, vancouver('2026-10-02 10:00'));

    $search = UsageReport::forRange('2026-10-01', '2026-10-10')->toArray()['zero_result_searches'][0];

    expect($search['filters'])->toBe([
        ['label' => 'Type of Study', 'value' => 'Meta Analysis'],
        ['label' => 'Theme', 'value' => 'Academic Implications'],
        ['label' => 'Subtheme', 'value' => 'University Administration'],
    ])->and($search['url'])->toBe('/articles/search?type_of_study=Meta%20Analysis&theme=Academic%20Implications&subtheme=University%20Administration');
});
