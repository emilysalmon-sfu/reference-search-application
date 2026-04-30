<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleImportUpload extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'articlesCreated',
    ];
}
