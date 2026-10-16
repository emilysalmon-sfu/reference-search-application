<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FindDuplicateArticles extends Command
{
    protected $signature = 'articles:duplicates';

    protected $description = 'Print articles that look like duplicates as CSV, for review. Changes nothing.';

    /**
     * "doi" groups share a DOI (in any spelling) and block the unique index.
     * "title_year" groups have no DOI but the same title and year: possible duplicates to review.
     */
    public function handle(): int
    {
        $byDoi = Article::whereNotNull('doi')->orderBy('id')->get()
            ->groupBy(fn (Article $article) => Article::normalizeDoi($article->doi));

        $byTitleYear = Article::whereNull('doi')->orderBy('id')->get()
            ->groupBy(fn (Article $article) => Str::of($article->title)->lower()->replaceMatches('/[^\pL\pN]+/u', ' ')->trim()
                .'|'.$article->year_published);

        $csv = fopen('php://temp', 'r+');
        fputcsv($csv, ['group_type', 'group_key', 'id', 'title', 'author', 'year', 'journal', 'doi', 'approved', 'source', 'created_at']);
        $this->writeGroups($csv, 'doi', $byDoi);
        $this->writeGroups($csv, 'title_year', $byTitleYear);

        rewind($csv);
        $this->output->write(stream_get_contents($csv));

        return self::SUCCESS;
    }

    /**
     * @param  resource  $csv
     * @param  Collection<string, Collection<int, Article>>  $groups
     */
    private function writeGroups($csv, string $type, Collection $groups): void
    {
        foreach ($groups->filter(fn (Collection $group) => $group->count() > 1) as $key => $articles) {
            foreach ($articles as $article) {
                fputcsv($csv, array_map($this->neutraliseFormula(...), [
                    $type,
                    $key,
                    $article->id,
                    $article->title,
                    $article->author,
                    $article->year_published,
                    $article->journal_name,
                    $article->doi,
                    $article->isApproved ? 'yes' : 'no',
                    $article->source,
                    $article->created_at,
                ]));
            }
        }
    }

    /**
     * Article fields come from public submissions: quote anything a spreadsheet would run as a formula.
     */
    private function neutraliseFormula(mixed $value): mixed
    {
        return is_string($value) && preg_match("/^[=+\-@\t\r]/", $value) ? "'".$value : $value;
    }
}
