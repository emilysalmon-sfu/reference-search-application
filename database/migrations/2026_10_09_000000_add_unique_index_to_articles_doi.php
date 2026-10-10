<?php

use App\Models\Article;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stores every DOI in canonical form, then makes DOIs unique.
     * Fails with "Duplicate entry" if two articles share a DOI: resolve those first.
     */
    public function up(): void
    {
        DB::table('articles')->whereNotNull('doi')->lazyById()->each(function ($article) {
            $doi = Article::normalizeDoi($article->doi);

            if ($doi !== $article->doi) {
                DB::table('articles')->where('id', $article->id)->update(['doi' => $doi]);
            }
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->unique('doi');
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropUnique(['doi']);
        });
    }
};
