<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * The Usage page as a workbook, built from the same UsageReport array.
 */
class UsageExport implements WithMultipleSheets
{
    public function __construct(private array $report)
    {
    }

    public function sheets(): array
    {
        $r = $this->report;
        $rows = fn (string $type, array $items, string $name) => array_map(fn ($item) => [$type, $item[$name], $item['visits']], $items);

        return [
            new UsageSheet('Summary', ['Metric', 'This period', 'Previous period', 'Change %'],
                array_map(fn ($s) => [$s['metric'], $s['current'], $s['previous'], $s['change']], $r['summary'])),
            new UsageSheet('Location', ['Type', 'Name', 'Visits'], [
                ...$rows('Region', $r['regions'], 'region'),
                ...array_map(fn ($c) => [
                    'Country',
                    \Locale::getDisplayRegion('-'.$c['country_code'], 'en').' ('.$c['country_code'].')',
                    $c['visits'],
                ], $r['countries']),
            ]),
            new UsageSheet('Sources', ['Type', 'Name', 'Visits'], [
                ...$rows('Source type', $r['source_types'], 'source_type'),
                ...$rows('Referring website', $r['referrers'], 'host'),
                ...array_map(fn ($c) => [
                    'Campaign',
                    implode(' / ', array_map(fn ($part) => $part ?? '-', [$c['utm_source'], $c['utm_medium'], $c['utm_campaign']])),
                    $c['visits'],
                ], $r['campaigns']),
            ]),
            new UsageSheet('Searches', ['Parameter', 'Value', 'Times used'],
                array_map(fn ($p) => [$p['label'], $p['value'], $p['count']], $r['parameters'])),
            new UsageSheet('No-result searches', ['Search', 'Times searched', 'Last searched'],
                array_map(fn ($z) => [
                    implode('; ', array_map(fn ($f) => "{$f['label']} | {$f['value']}", $z['filters'])),
                    $z['count'],
                    $z['last_searched'],
                ], $r['zero_result_searches'])),
            new UsageSheet('Devices', ['Device', 'Visits'],
                array_map(fn ($d) => [$d['device'], $d['visits']], $r['devices'])),
        ];
    }
}
