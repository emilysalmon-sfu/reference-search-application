<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ArticlesExport implements FromCollection, WithHeadings, WithMapping
{
    protected Collection $articles;

    public function __construct(Collection $articles)
    {
        $this->articles = $articles;
    }

    public function collection()
    {
        return $this->articles;
    }

    private function asText($v): string
    {
        if ($v === null) {
            return '';
        }

        // Convert arrays/objects to a reasonable string
        if (is_array($v)) {
            // if it's a simple list, join nicely; otherwise json encode
            $isList = array_keys($v) === range(0, count($v) - 1);
            $v = $isList ? implode('; ', array_map(fn($x) => (string)$x, $v)) : json_encode($v);
        } elseif (is_object($v)) {
            // If it's a Laravel Collection or other object, try common conversions
            if (method_exists($v, 'toArray')) {
                $arr = $v->toArray();
                $isList = array_keys($arr) === range(0, count($arr) - 1);
                $v = $isList ? implode('; ', array_map(fn($x) => (string)$x, $arr)) : json_encode($arr);
            } elseif (method_exists($v, '__toString')) {
                $v = (string)$v;
            } else {
                $v = json_encode($v);
            }
        }

        $v = (string)$v;

        // Prevent formulas / Excel injection
        if ($v !== '' && preg_match('/^[=\+\-@]/', $v)) {
            return "'" . $v;
        }

        return $v;
    }


    public function map($article): array
    {
        return [
            $this->asText($article->author),
            $this->asText($article->title),
            $this->asText($article->year_published),
            $this->asText($article->journal_name),
            $this->asText($article->abstract),
            $this->asText($article->doi ? ('https://doi.org/' . $article->doi) : ''),
            $this->asText($article->keywords),
            $this->asText($article->theme),
            $this->asText($article->sub_theme_1),
            $this->asText($article->country),
            $this->asText($article->type_of_study),
        ];
    }

    public function headings(): array
    {
        return [
            'Author',
            'Title',
            'Year Published',
            'Journal',
            'Abstract',
            'DOI',
            'Keywords',
            'Theme',
            'Sub Theme 1',
            'Country',
            'Type of Study',
        ];
    }
}
