<?php

use App\Models\Article;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Stores every DOI in canonical form so duplicate checks (and `articles:duplicates`) see one spelling per DOI.
     * The unique index comes in a later migration, once the duplicates have been cleaned up.
     */
    public function up(): void
    {
        DB::table('articles')->whereNotNull('doi')->lazyById()->each(function ($article) {
            $doi = Article::normalizeDoi($article->doi);

            if ($doi !== $article->doi) {
                DB::table('articles')->where('id', $article->id)->update(['doi' => $doi]);
            }
        });
    }

    /**
     * Normalization is not reversible: the original spellings are not kept.
     */
    public function down(): void
    {
    }
};
