<?php

namespace App\Imports;

use App\Models\Article;
use App\Models\Config;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ArticlesImport implements ToModel, WithChunkReading, WithHeadingRow, WithMultipleSheets, WithCalculatedFormulas
{
    private int $articlesImported = 0;

    private Config $config;

    public function __construct()
    {
        $this->config = Config::current();
    }

    public function sheets(): array
    {
        $worksheet = $this->config->worksheet_name ?: 'Sheet1';

        return [
            $worksheet => $this,
        ];
    }

    /**
     * How many rows to process per chunk.
     */
    public function chunkSize(): int
    {
        return 150;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        try {
            $author = $row[$this->config->column_map['author'] ?? 'Author.Name'] ?? null;
            $title = $row[$this->config->column_map['title'] ?? 'Title'] ?? null;
            $year_published_raw = $row[$this->config->column_map['year_published'] ?? 'Date'] ?? null;
            // Only accept numeric years (4 digits), otherwise set to null
            $year_published = is_numeric($year_published_raw) && strlen((string) $year_published_raw) === 4
                ? (int) $year_published_raw
                : null;
            $journal_name = $row[$this->config->column_map['journal_name'] ?? 'Journal.Name'] ?? null;
            $keywordsRaw = (string) ($row[$this->config->column_map['keywords'] ?? 'Keyword'] ?? '');
            $keywords = collect(preg_split("/[\r\n,;]+/", $keywordsRaw))
                ->map(fn($k) => trim($k))
                ->filter()
                ->unique()
                ->values()
                ->all();

            $abstract = $row[$this->config->column_map['abstract'] ?? 'Abstract'] ?? null;
            $doi = $row[$this->config->column_map['doi'] ?? 'DOI'] ?? null;

            $theme = $row[$this->config->column_map['theme'] ?? 'Theme'] ?? null;
            $sub_theme_1 = $row[$this->config->column_map['sub_theme_1'] ?? 'Sub-Theme 1'] ?? null;

            $country = $row[$this->config->column_map['country'] ?? 'Country'] ?? null;
            $type_of_study = $row[$this->config->column_map['type_of_study'] ?? 'Type'] ?? null;

            $article = Article::firstOrCreate(
                [
                    'author' => $author,
                    'title' => $title,
                ],
                [
                    'year_published' => $year_published,
                    'journal_name' => $journal_name,
                    'keywords' => $keywords,
                    'abstract' => $abstract,
                    'doi' => $doi,
                    'theme' => $theme ? ucwords((string) $theme) : null,
                    'sub_theme_1' => $sub_theme_1 ? ucwords((string) $sub_theme_1) : null,
                    'country' => $country ? ucwords((string) $country) : null,
                    'type_of_study' => $type_of_study ? ucwords((string) $type_of_study) : null,
                    'source' => Article::SOURCE_IMPORT,
                ],
            );

            if ($article->wasRecentlyCreated) {
                $this->articlesImported++;
            }

            return $article;
        } catch (\Throwable $e) {
            Log::error('File upload/import failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return null;
        }
    }

    public function getArticlesImportedCount(): int
    {
        return $this->articlesImported;
    }
}
