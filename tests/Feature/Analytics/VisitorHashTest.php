<?php

use App\Analytics\Analytics;
use App\Models\AnalyticsSalt;
use Carbon\CarbonImmutable;

test('the visitor hash is stable within a vancouver day and rotates the next day', function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-12 23:30', 'America/Vancouver'));
    $first = Analytics::visitorHash(analyticsRequest());

    expect($first)->toHaveLength(64)
        ->and(Analytics::visitorHash(analyticsRequest()))->toBe($first)
        ->and(Analytics::visitorHash(analyticsRequest(server: ['REMOTE_ADDR' => '203.0.113.8'])))->not->toBe($first);

    $this->travelTo(CarbonImmutable::parse('2026-10-13 00:10', 'America/Vancouver'));

    expect(Analytics::visitorHash(analyticsRequest()))->not->toBe($first)
        ->and(AnalyticsSalt::pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->all())->toBe(['2026-10-13']);
});
