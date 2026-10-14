<?php

use App\Models\Article;
use App\Models\ArticleImportUpload;
use App\Models\Config;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Inertia\Testing\AssertableInertia as Assert;

const DEFAULT_HEADINGS = [
    'Author.Name', 'Title', 'Date', 'Journal.Name', 'Keyword', 'Abstract',
    'DOI', 'Theme', 'Sub-Theme 1', 'Country', 'Type',
];

function importRow(array $overrides = []): array
{
    return array_values(array_merge([
        'Author.Name' => 'Smith, J.',
        'Title' => 'Working hours and wellbeing',
        'Date' => 2019,
        'Journal.Name' => 'Journal of Work',
        'Keyword' => "stress; burnout\nsleep, stress",
        'Abstract' => 'An abstract.',
        'DOI' => 'https://doi.org/10.1000/ABC',
        'Theme' => 'work life',
        'Sub-Theme 1' => 'flexible hours',
        'Country' => 'canada',
        'Type' => 'empirical',
    ], $overrides));
}

test('guests cannot upload', function () {
    $this->get('/admin/upload')->assertRedirect(route('login'));
    $this->post('/admin/upload')->assertRedirect(route('login'));
});

test('the upload page renders', function () {
    $this->actingAs(approver())
        ->get('/admin/upload')
        ->assertInertia(fn (Assert $page) => $page->component('Upload/upload'));
});

test('uploads must be spreadsheets', function (?UploadedFile $file) {
    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => $file])
        ->assertSessionHasErrors('file');
})->with([
    'missing' => [null],
    'wrong type' => [fn () => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')],
    'too big' => [fn () => UploadedFile::fake()->create('big.xlsx', 26000)],
]);

test('a spreadsheet is imported as approved articles', function () {
    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([DEFAULT_HEADINGS, importRow()])])
        ->assertSessionHas('success', 'File uploaded: 1 created, 0 updated with a DOI, 0 skipped (already in the database).');

    expect(Article::sole())
        ->author->toBe('Smith, J.')
        ->title->toBe('Working hours and wellbeing')
        ->year_published->toEqual('2019')
        ->journal_name->toBe('Journal of Work')
        ->keywords->toBe(['stress', 'burnout', 'sleep'])
        ->abstract->toBe('An abstract.')
        ->doi->toBe('10.1000/abc')
        ->theme->toBe('Work Life')
        ->sub_theme_1->toBe('Flexible Hours')
        ->country->toBe('Canada')
        ->type_of_study->toBe('Empirical')
        ->source->toBe(Article::SOURCE_IMPORT)
        ->isApproved->toBeTruthy();

    expect(ArticleImportUpload::sole()->articlesCreated)->toBe(1);
});

test('years that are not four digits are left empty', function (mixed $date) {
    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([DEFAULT_HEADINGS, importRow(['Date' => $date])])]);

    expect(Article::sole()->year_published)->toBeNull();
})->with(['n.d.', 19, 'Spring 2019']);

test('formulas are imported as their calculated value', function () {
    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([DEFAULT_HEADINGS, importRow(['Date' => '=2000+19'])])]);

    expect(Article::sole()->year_published)->toEqual('2019');
});

test('empty optional cells are stored as null', function () {
    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['Keyword' => null, 'DOI' => null, 'Theme' => null, 'Sub-Theme 1' => null, 'Country' => null, 'Type' => null]),
    ])]);

    expect(Article::sole())
        ->keywords->toBe([])
        ->doi->toBeNull()
        ->theme->toBeNull()
        ->sub_theme_1->toBeNull()
        ->country->toBeNull()
        ->type_of_study->toBeNull();
});

test('rows whose DOI is already in the database are skipped, whatever the author or title', function () {
    Article::factory()->create(['author' => 'J. Smith', 'title' => 'Working Hours & Wellbeing', 'doi' => '10.1000/abc', 'abstract' => 'Original']);

    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['DOI' => 'https://doi.org/10.1000/ABC', 'Abstract' => 'Changed']),
        importRow(['DOI' => '10.1000/new', 'Title' => 'A different paper']),
    ])]);

    expect(Article::count())->toBe(2)
        ->and(Article::firstWhere('doi', '10.1000/abc')->abstract)->toBe('Original')
        ->and(ArticleImportUpload::sole()->articlesCreated)->toBe(1);
});

test('rows with a new DOI are imported even if the author and title already exist', function () {
    Article::factory()->create(['author' => 'Smith, J.', 'title' => 'Working hours and wellbeing', 'doi' => '10.1000/first']);

    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['DOI' => '10.1000/second']),
    ])]);

    expect(Article::pluck('doi')->sort()->values()->all())->toBe(['10.1000/first', '10.1000/second']);
});

test('the same DOI twice in one file is imported once', function () {
    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['DOI' => '10.1000/abc']),
        importRow(['DOI' => 'doi:10.1000/ABC', 'Title' => 'Same paper, retitled']),
    ])]);

    expect(Article::count())->toBe(1)
        ->and(ArticleImportUpload::sole()->articlesCreated)->toBe(1);
});

test('spreadsheet errors in the DOI column count as no DOI', function () {
    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['DOI' => '#REF!', 'Title' => 'First paper']),
        importRow(['DOI' => '#REF!', 'Title' => 'Second paper']),
    ])]);

    expect(Article::orderBy('id')->pluck('doi', 'title')->all())->toBe([
        'First paper' => null,
        'Second paper' => null,
    ]);
});

test('a re-uploaded DOI is filled in on the existing article that has none', function () {
    $article = Article::factory()->create(['author' => 'Smith, J.', 'title' => 'Working hours and wellbeing', 'doi' => null, 'abstract' => 'Original']);

    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['DOI' => '10.1000/abc', 'Abstract' => 'Changed']),
    ])]);

    expect(Article::count())->toBe(1)
        ->and($article->fresh())
        ->doi->toBe('10.1000/abc')
        ->abstract->toBe('Original');
});

test('the upload reports how many rows were created, updated and skipped', function () {
    Article::factory()->create(['doi' => '10.1000/known']);
    Article::factory()->create(['author' => 'Lee, K.', 'title' => 'Missing DOI', 'doi' => null]);

    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([
            DEFAULT_HEADINGS,
            importRow(['DOI' => '10.1000/new-one', 'Title' => 'New one']),
            importRow(['DOI' => '10.1000/new-two', 'Title' => 'New two']),
            importRow(['DOI' => '10.1000/known']),
            importRow(['DOI' => '10.1000/filled', 'Author.Name' => 'Lee, K.', 'Title' => 'Missing DOI']),
        ])])
        ->assertSessionHas('success', 'File uploaded: 2 created, 1 updated with a DOI, 1 skipped (already in the database).');

    expect(ArticleImportUpload::sole()->articlesCreated)->toBe(2);
});

test('blank rows in the spreadsheet are ignored', function () {
    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([
            DEFAULT_HEADINGS,
            importRow(),
            array_fill(0, count(DEFAULT_HEADINGS), null),
            importRow(['DOI' => '10.1000/second', 'Title' => 'Second']),
        ])])
        ->assertSessionHas('success', 'File uploaded: 2 created, 0 updated with a DOI, 0 skipped (already in the database).');

    expect(Article::count())->toBe(2);
});

test('rows without a DOI fall back to matching author and title', function () {
    Article::factory()->create(['author' => 'Smith, J.', 'title' => 'Working hours and wellbeing', 'abstract' => 'Original']);

    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['DOI' => null, 'Abstract' => 'Changed']),
        importRow(['DOI' => null, 'Title' => 'A different paper']),
    ])]);

    expect(Article::count())->toBe(2)
        ->and(Article::firstWhere('title', 'Working hours and wellbeing')->abstract)->toBe('Original')
        ->and(ArticleImportUpload::sole()->articlesCreated)->toBe(1);
});

test('the worksheet name and column names come from the settings', function () {
    Config::current()->update([
        'worksheet_name' => 'Articles',
        'column_map' => ['author' => 'Writer', 'title' => 'Paper'],
    ]);

    $headings = DEFAULT_HEADINGS;
    $headings[0] = 'Writer';
    $headings[1] = 'Paper';

    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([$headings, importRow()], 'Articles')])
        ->assertSessionHas('success');

    expect(Article::sole())
        ->author->toBe('Smith, J.')
        ->title->toBe('Working hours and wellbeing');
});

test('a missing worksheet fails the upload with a message', function () {
    Log::spy();

    $this->actingAs(approver())
        ->post('/admin/upload', ['file' => spreadsheetUpload([DEFAULT_HEADINGS, importRow()], 'Other')])
        ->assertSessionHas('error', fn ($error) => str_starts_with($error, 'Import failed: '));

    expect(Article::count())->toBe(0);
    Log::shouldHaveReceived('error')->with('File upload/import failed', Mockery::any());
});

test('a row that fails to save is logged and the rest are imported', function () {
    Log::spy();
    Article::creating(function (Article $article) {
        if ($article->title === 'Broken row') {
            throw new RuntimeException('Bad row');
        }
    });

    $this->actingAs(approver())->post('/admin/upload', ['file' => spreadsheetUpload([
        DEFAULT_HEADINGS,
        importRow(['Title' => 'Broken row']),
        importRow(['Title' => 'Good row']),
    ])])->assertSessionHas('success');

    expect(Article::pluck('title')->all())->toBe(['Good row'])
        ->and(ArticleImportUpload::sole()->articlesCreated)->toBe(1);
    Log::shouldHaveReceived('error')->with('File upload/import failed', Mockery::on(fn ($context) => $context['message'] === 'Bad row'));
});
