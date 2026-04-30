<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('author', 512)->nullable(true);
            $table->string('title')->nullable(true);
            $table->string('year_published')->nullable(true);
            $table->string('journal_name')->nullable(true);
            $table->json('keywords')->nullable(true);
            $table->text('abstract')->nullable(true);
            $table->string('doi')->nullable(true);
            $table->string('theme')->nullable(true);
            $table->string('sub_theme_1')->nullable(true);
            $table->string('country')->nullable(true);
            $table->string('type_of_study')->nullable(true);
            $table->string('source')->default('admin');
            $table->boolean('isApproved')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
