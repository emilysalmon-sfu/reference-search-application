<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Anonymous usage analytics. No IPs, user agents or cookies are stored:
     * visitors are a daily-rotating hash (see App\Analytics\Analytics).
     */
    public function up(): void
    {
        Schema::create('analytics_salts', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('salt', 64);
        });

        Schema::create('analytics_visits', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_hash', 64);
            $table->timestamp('started_at')->index();
            $table->timestamp('last_seen_at');
            $table->string('source_type', 16);
            $table->string('source_host')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->char('country_code', 2)->nullable();
            $table->string('region')->nullable();
            $table->string('device_type', 8);
            $table->string('landing_path');
            $table->index(['visitor_hash', 'last_seen_at']);
        });

        Schema::create('analytics_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->nullable()->constrained('analytics_visits')->nullOnDelete();
            $table->text('params');
            $table->unsignedInteger('result_count');
            $table->timestamp('searched_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_searches');
        Schema::dropIfExists('analytics_visits');
        Schema::dropIfExists('analytics_salts');
    }
};
