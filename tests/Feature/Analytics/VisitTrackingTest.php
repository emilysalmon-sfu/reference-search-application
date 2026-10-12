<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\TrackVisits;
use App\Models\AnalyticsSalt;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsVisit;
use Illuminate\Support\Facades\Exceptions;

function browse(string $uri, array $headers = [], string $ip = '203.0.113.7')
{
    return test()->withServerVariables(['REMOTE_ADDR' => $ip])
        ->withHeaders(['User-Agent' => DESKTOP_UA, ...$headers])
        ->get($uri);
}

function inertiaHeaders(): array
{
    return ['X-Inertia' => 'true', 'X-Inertia-Version' => (string) app(HandleInertiaRequests::class)->version(request())];
}

test('a page view starts a visit with its details', function () {
    browse('/introduction', ['Referer' => 'https://lnkd.in/x', 'CF-IPCountry' => 'CA'])->assertOk();

    expect(AnalyticsVisit::sole())->toMatchArray([
        'source_type' => 'social',
        'source_host' => 'lnkd.in',
        'country_code' => 'CA',
        'region' => 'North America',
        'device_type' => 'desktop',
        'landing_path' => '/introduction',
    ]);
});

test('views within 30 minutes extend the visit and a view after 31 minutes starts a new one', function () {
    browse('/');
    $this->travel(29)->minutes();
    browse('/introduction');

    expect(AnalyticsVisit::count())->toBe(1);

    $this->travel(31)->minutes();
    browse('/');

    expect(AnalyticsVisit::count())->toBe(2);
});

test('inertia navigation counts as a page view', function () {
    browse('/introduction', inertiaHeaders())->assertOk();

    expect(AnalyticsVisit::count())->toBe(1);
});

test('requests that are not public page views are not tracked', function (string $method, string $uri, array $headers, bool $loggedIn) {
    if (isset($headers['X-Inertia'])) {
        $headers = [...inertiaHeaders(), ...$headers];
    }

    if ($loggedIn) {
        $this->actingAs(admin());
    }

    $headers = ['User-Agent' => DESKTOP_UA, ...$headers];
    $method === 'POST' ? $this->post($uri, [], $headers) : $this->get($uri, $headers);

    expect(AnalyticsVisit::count())->toBe(0);
})->with([
    'bot' => ['GET', '/', ['User-Agent' => BOT_UA], false],
    'partial reload' => ['GET', '/', ['X-Inertia' => 'true', 'X-Inertia-Partial-Data' => 'articles', 'X-Inertia-Partial-Component' => 'articles'], false],
    'prefetch' => ['GET', '/', ['Purpose' => 'prefetch'], false],
    'sec-purpose prefetch' => ['GET', '/', ['Sec-Purpose' => 'prefetch'], false],
    'post' => ['POST', '/report-feedback', [], false],
    'redirect' => ['GET', '/dashboard', [], false],
    'not found' => ['GET', '/does-not-exist', [], false],
    'download' => ['GET', '/export', [], false],
    'admin page' => ['GET', '/admin/dashboard', [], true],
    'logged-in visitor' => ['GET', '/', [], true],
]);

test('no raw ip or user agent is stored', function () {
    browse('/articles/search?keywords=balance', ip: '198.51.100.23');

    $stored = json_encode([AnalyticsVisit::all(), AnalyticsSearch::all(), AnalyticsSalt::all()]);

    expect(AnalyticsVisit::count())->toBe(1)
        ->and($stored)->not->toContain('198.51.100.23')
        ->and($stored)->not->toContain('Chrome/129');
});

test('tracking adds no cookies', function () {
    $names = fn ($response) => collect($response->headers->getCookies())->map->getName()->sort()->values()->all();

    $tracked = $names(browse('/'));
    $untracked = $names($this->withoutMiddleware(TrackVisits::class)->get('/'));

    expect(AnalyticsVisit::count())->toBe(1)
        ->and($tracked)->toBe($untracked);
});

test('a tracking failure does not break the page', function () {
    Exceptions::fake();
    failQueriesContaining('analytics_visits');

    browse('/')->assertOk();

    Exceptions::assertReported(RuntimeException::class);
});
