<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Makes DOIs unique at the database level. Run only after `php artisan articles:duplicates`
     * reports no "doi" groups: with duplicates left, this fails and the deploy stops.
     */
    public function up(): void
    {
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
