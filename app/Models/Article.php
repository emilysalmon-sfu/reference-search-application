<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'author',
        'title',
        'year_published',
        'journal_name',
        'abstract',
        'doi',
        'keywords',
        'theme',
        'sub_theme_1',
        'country',
        'type_of_study',
        'isApproved',
        'source',
    ];

    /**
     * Source constants
     */
    public const SOURCE_ADMIN = 'admin';
    public const SOURCE_USER = 'user';
    public const SOURCE_IMPORT = 'import';

    protected $casts = [
        'keywords' => 'array',
    ];

    /**
     * Always store DOIs in their canonical form.
     */
    protected function doi(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => static::normalizeDoi($value),
        );
    }

    /**
     * Normalizes a DOI to its bare, lowercase form (DOIs are case-insensitive).
     * e.g. "https://doi.org/10.1000/XYZ" or "doi: 10.1000/xyz" -> "10.1000/xyz"
     * Blank values and non-DOIs (every DOI starts with "10.", so "#REF!", "N/A") become null.
     */
    public static function normalizeDoi(mixed $doi): ?string
    {
        if ($doi === null) {
            return null;
        }

        $normalized = trim((string) $doi);
        $normalized = preg_replace('~^(?:https?://)?(?:dx\.|www\.)?doi\.org/~i', '', $normalized);
        $normalized = preg_replace('~^doi:\s*~i', '', $normalized);
        $normalized = mb_strtolower(trim($normalized));

        return str_starts_with($normalized, '10.') ? $normalized : null;
    }
}
