<?php

namespace App\Imports\Sheets;

use App\Models\Article;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithGroupedHeadingRow;

class ArticleSheetImport implements ToModel, WithCalculatedFormulas, WithChunkReading, WithGroupedHeadingRow
{
    private int $articlesImported = 0;

    public function chunkSize(): int
    {
        return 150;
    }

    public function model(array $row)
    {
        try {
            // Two columns 'type' exist in the sheet, one for 'type_of_study' and another for 'methodology'
            $typeOfStudyColumn = $row['type'] ?? null;
            $typeOfStudy = is_array($typeOfStudyColumn) ? ($typeOfStudyColumn[0] ?? null) : $typeOfStudyColumn;

            // Normalize keywords - split by newlines, commas, or semicolons and rejoin with consistent separator
            $keywords = $row['keyword'] ?? null;
            if ($keywords && is_string($keywords)) {
                $keywordsArray = preg_split('/[\r\n,;]+/', $keywords);
                $keywordsArray = array_map('trim', $keywordsArray);
                $keywordsArray = array_filter($keywordsArray); // Remove empty values
                $keywords = implode(', ', $keywordsArray);
            }

            $article = Article::firstOrCreate(
                [
                    'author' => $row['authorname'] ?? null,
                    'title' => $row['title'] ?? null,
                    'year_published' => $row['date'] ?? null,
                    'journal_name' => $row['journalname'] ?? null,
                    'keywords' => $keywords,
                    'abstract' => $row['abstract'] ?? null,
                    'doi' => $row['doi'] ?? null,
                    'theme' => ucwords($row['theme']) ?? null,
                    'sub_theme_1' => ucwords($row['sub_theme_1']) ?? null,
                    'country' => ucwords($row['country'], '') ?? null,
                    'type_of_study' => ucwords($typeOfStudy, ''),
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
