<?php

use App\Analytics\Analytics;

test('visitor source is classified', function (array $query, ?string $referer, string $type, ?string $host) {
    $request = analyticsRequest('https://indigimos.com/?'.http_build_query($query), array_filter(['HTTP_REFERER' => $referer]));

    expect(Analytics::source($request))->toMatchArray(['source_type' => $type, 'source_host' => $host]);
})->with([
    'utm beats referer' => [['utm_source' => 'newsletter', 'utm_medium' => 'email', 'utm_campaign' => 'fall'], 'https://www.google.com/', 'campaign', null],
    'no referer' => [[], null, 'direct', null],
    'own site with www' => [[], 'https://www.indigimos.com/introduction', 'direct', null],
    'google country domain' => [[], 'https://www.google.ca/', 'search', 'google.ca'],
    'google subdomain' => [[], 'https://scholar.google.com/', 'search', 'scholar.google.com'],
    'social short link' => [[], 'https://lnkd.in/abc', 'social', 'lnkd.in'],
    'facebook mobile' => [[], 'https://m.facebook.com/', 'social', 'm.facebook.com'],
    'other website' => [[], 'https://www.guides.library.example.edu/indigenous', 'website', 'guides.library.example.edu'],
    'garbage referer' => [[], 'not a url', 'direct', null],
]);

test('campaign keeps utm fields', function () {
    $request = analyticsRequest('/?utm_source=newsletter&utm_medium=email&utm_campaign=fall');

    expect(Analytics::source($request))->toBe([
        'source_type' => 'campaign', 'source_host' => null,
        'utm_source' => 'newsletter', 'utm_medium' => 'email', 'utm_campaign' => 'fall',
    ]);
});

test('a referring host longer than the column is cut to 255 characters', function () {
    $request = analyticsRequest(server: ['HTTP_REFERER' => 'https://'.str_repeat('a', 300).'.example.com/page']);

    $source = Analytics::source($request);

    expect($source['source_type'])->toBe('website')
        ->and(mb_strlen($source['source_host']))->toBe(255);
});

test('devices are classified and bots are rejected', function (?string $ua, ?string $expected) {
    expect(Analytics::device($ua))->toBe($expected);
})->with([
    'desktop' => [DESKTOP_UA, 'desktop'],
    'mobile' => [MOBILE_UA, 'mobile'],
    'tablet' => [TABLET_UA, 'tablet'],
    'googlebot' => [BOT_UA, null],
    'headless fallback' => ['Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/129.0.0.0', null],
    'empty' => ['', null],
    'missing' => [null, null],
]);

test('country comes from cloudflare and maps to a region', function (?string $header, ?string $country, ?string $region) {
    $request = analyticsRequest(server: array_filter(['HTTP_CF_IPCOUNTRY' => $header]));

    expect(Analytics::country($request))->toBe($country)
        ->and(Analytics::region($country))->toBe($region);
})->with([
    'canada' => ['CA', 'CA', 'North America'],
    'lowercase france' => ['fr', 'FR', 'Europe'],
    'australia' => ['AU', 'AU', 'Oceania'],
    'japan' => ['JP', 'JP', 'Asia'],
    'brazil' => ['BR', 'BR', 'South America'],
    'kenya' => ['KE', 'KE', 'Africa'],
    'jamaica' => ['JM', 'JM', 'Other'],
    'unknown' => ['XX', null, null],
    'tor' => ['T1', null, null],
    'missing' => [null, null, null],
]);
