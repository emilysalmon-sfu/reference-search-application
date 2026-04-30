<?php

namespace Database\Seeders;

use App\Models\Config;
use Illuminate\Database\Seeder;

class ConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Config::create([
            'worksheet_name' => 'Sheet1',
            'column_map' => [
                'author' => 'Author.Name',
                'title' => 'Title',
                'journal_name' => 'Journal.Name',
                'keywords' => 'Keyword',
                'abstract' => 'Abstract',
                'year_published' => 'Date',
                'doi' => 'DOI',
                'sub_theme_1' => 'Sub-Theme 1',
                'theme' => 'Theme',
                'country' => 'Country',
                'type_of_study' => 'Type',
            ],
            'type_styles' => [
                'Empirical' => ['bg' => 'bg-green-100 dark:bg-green-900', 'text' => 'text-green-800 dark:text-green-200'],
                'Opinion' => ['bg' => 'bg-blue-100 dark:bg-blue-900', 'text' => 'text-blue-800 dark:text-blue-200'],
                'Historical Analysis' => ['bg' => 'bg-yellow-100 dark:bg-yellow-900', 'text' => 'text-yellow-800 dark:text-yellow-200'],
                'Conceptual' => ['bg' => 'bg-orange-100 dark:bg-orange-900', 'text' => 'text-orange-800 dark:text-orange-200'],
                'Lit Review' => ['bg' => 'bg-purple-100 dark:bg-purple-900', 'text' => 'text-purple-800 dark:text-purple-200'],
                'Case Study' => ['bg' => 'bg-red-100 dark:bg-red-900', 'text' => 'text-red-800 dark:text-red-200'],
                'Meta Analysis' => ['bg' => 'bg-teal-100 dark:bg-teal-900', 'text' => 'text-teal-800 dark:text-teal-200'],
            ],
        ]);
    }
}
