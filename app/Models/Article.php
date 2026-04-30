<?php

namespace App\Models;

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
}
