<?php

use App\Analytics\UsageReport;
use App\Exports\UsageExport;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsVisit;
use Carbon\CarbonImmutable;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

test('the export has six sheets with the expected headers and dashboard values', function () {
    $at = CarbonImmutable::parse('2026-10-02 12:00', 'America/Vancouver')->utc();
    AnalyticsVisit::create([
        'visitor_hash' => str_repeat('a', 64), 'started_at' => $at, 'last_seen_at' => $at, 'source_type' => 'campaign',
        'utm_source' => 'newsletter', 'utm_campaign' => 'fall', 'country_code' => 'CA',
        'device_type' => 'tablet', 'landing_path' => '/',
    ]);
    AnalyticsSearch::create(['params' => '{"keywords":"salmon"}', 'result_count' => 0, 'searched_at' => $at]);

    $path = tempnam(sys_get_temp_dir(), 'usage').'.xlsx';
    file_put_contents($path, Excel::raw(new UsageExport(UsageReport::forRange('2026-10-01', '2026-10-10')->toArray()), \Maatwebsite\Excel\Excel::XLSX));
    $book = IOFactory::load($path);
    $sheet = fn (string $name) => $book->getSheetByName($name)->toArray(null, false, false);

    expect($book->getSheetNames())->toBe(['Summary', 'Location', 'Sources', 'Searches', 'No-result searches', 'Devices'])
        ->and($sheet('Summary')[0])->toBe(['Metric', 'This period', 'Previous period', 'Change %'])
        ->and($sheet('Summary')[1])->toBe(['Visits', 1, 0, null])
        ->and($sheet('Location'))->toBe([['Type', 'Name', 'Visits'], ['Region', 'North America', 1], ['Country', 'Canada (CA)', 1]])
        ->and($sheet('Sources'))->toBe([
            ['Type', 'Name', 'Visits'],
            ['Source type', 'campaign', 1],
            ['Campaign', 'newsletter / - / fall', 1],
        ])
        ->and($sheet('Searches'))->toBe([['Parameter', 'Value', 'Times used'], ['Keywords', 'salmon', 1]])
        ->and($sheet('No-result searches'))->toBe([['Search', 'Times searched', 'Last searched'], ['Keywords: salmon', 1, '2026-10-02 12:00']])
        ->and($sheet('Devices'))->toBe([['Device', 'Visits'], ['mobile', 1]]);
});

test('admins download the report named after the range', function () {
    $this->actingAs(admin())
        ->get('/admin/usage/export?from=2026-10-01&to=2026-10-10')
        ->assertDownload('usage-report_2026-10-01_to_2026-10-10.xlsx');
});

test('approvers cannot export', function () {
    $this->actingAs(approver())
        ->get('/admin/usage/export?from=2026-10-01&to=2026-10-10')
        ->assertRedirect('/admin/dashboard');
});

test('visitor-typed values are written as text, never as formulas', function () {
    $at = CarbonImmutable::parse('2026-10-02 12:00', 'America/Vancouver')->utc();
    AnalyticsSearch::create(['params' => json_encode(['keywords' => '=HYPERLINK("https://evil.example","Open")']), 'result_count' => 0, 'searched_at' => $at]);

    $path = tempnam(sys_get_temp_dir(), 'usage').'.xlsx';
    file_put_contents($path, Excel::raw(new UsageExport(UsageReport::forRange('2026-10-01', '2026-10-10')->toArray()), \Maatwebsite\Excel\Excel::XLSX));
    $cell = IOFactory::load($path)->getSheetByName('Searches')->getCell('B2');

    expect($cell->getDataType())->toBe(\PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING)
        ->and($cell->getValue())->toBe('=HYPERLINK("https://evil.example","Open")');
});
