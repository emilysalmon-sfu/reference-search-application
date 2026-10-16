<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function admin(): User
{
    return User::factory()->admin()->create();
}

function approver(): User
{
    return User::factory()->approver()->create();
}

/**
 * A valid article form submission.
 */
function articlePayload(array $overrides = []): array
{
    return array_merge([
        'author' => 'Smith, J.',
        'title' => 'A study on balance',
        'year_published' => '2020',
        'journal_name' => 'Journal of Tests',
    ], $overrides);
}

/**
 * Makes every SQL query containing one of the given fragments throw,
 * to exercise the "database failed" branches of controllers.
 */
function failQueriesContaining(string ...$fragments): void
{
    DB::listen(function ($query) use ($fragments) {
        foreach ($fragments as $fragment) {
            if (str_contains($query->sql, $fragment)) {
                throw new RuntimeException("Simulated database failure on: {$fragment}");
            }
        }
    });
}

/**
 * Builds a real .xlsx upload. The first row of $rows is the heading row.
 */
function spreadsheetUpload(array $rows, string $sheetName = 'Sheet1'): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle($sheetName);
    $sheet->fromArray($rows, null, 'A1', true);

    $path = tempnam(sys_get_temp_dir(), 'import').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile($path, 'articles.xlsx', null, null, true);
}

/** Inserts a row directly, bypassing the model's DOI normalization. */
function insertLegacyArticle(string $doi, bool $approved = true): int
{
    return DB::table('articles')->insertGetId([
        'author' => 'Legacy, A.',
        'title' => 'Legacy title',
        'journal_name' => 'Old Journal',
        'doi' => $doi,
        'isApproved' => $approved,
    ]);
}

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
const TABLET_UA = 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

/**
 * What a real desktop browser sends with every request (analytics only counts requests that have them).
 */
function browserHeaders(): array
{
    return ['User-Agent' => DESKTOP_UA, 'Sec-Fetch-Mode' => 'navigate', 'Accept-Language' => 'en-CA,en;q=0.9'];
}

/**
 * A GET request from a desktop browser at a fixed IP, for the analytics helpers.
 */
function analyticsRequest(string $uri = '/', array $server = []): Illuminate\Http\Request
{
    return Illuminate\Http\Request::create($uri, 'GET', server: [
        'REMOTE_ADDR' => '203.0.113.7',
        'HTTP_USER_AGENT' => DESKTOP_UA,
        'HTTP_SEC_FETCH_MODE' => 'navigate',
        'HTTP_ACCEPT_LANGUAGE' => 'en-CA,en;q=0.9',
        ...$server,
    ]);
}

/**
 * A browser page view from a fixed IP, as the analytics middleware sees it.
 */
function browse(string $uri, array $headers = [], string $ip = '203.0.113.7')
{
    return test()->withServerVariables(['REMOTE_ADDR' => $ip])
        ->withHeaders([...browserHeaders(), ...$headers])
        ->get($uri);
}
