<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Config extends Model
{
    protected $fillable = ['worksheet_name', 'column_map', 'type_styles'];

    protected $casts = [
        'column_map' => 'array',
        'type_styles' => 'array',
    ];

    /**
     * Default type styles for type_of_study badges (used for seeding)
     */
    public static function defaultTypeStyles(): array
    {
        return [
            'Empirical' => ['bg' => 'bg-green-100 dark:bg-green-900', 'text' => 'text-green-800 dark:text-green-200'],
            'Opinion' => ['bg' => 'bg-blue-100 dark:bg-blue-900', 'text' => 'text-blue-800 dark:text-blue-200'],
            'Historical Analysis' => ['bg' => 'bg-yellow-100 dark:bg-yellow-900', 'text' => 'text-yellow-800 dark:text-yellow-200'],
            'Conceptual' => ['bg' => 'bg-orange-100 dark:bg-orange-900', 'text' => 'text-orange-800 dark:text-orange-200'],
            'Lit Review' => ['bg' => 'bg-purple-100 dark:bg-purple-900', 'text' => 'text-purple-800 dark:text-purple-200'],
            'Case Study' => ['bg' => 'bg-red-100 dark:bg-red-900', 'text' => 'text-red-800 dark:text-red-200'],
            'Meta Analysis' => ['bg' => 'bg-teal-100 dark:bg-teal-900', 'text' => 'text-teal-800 dark:text-teal-200'],
        ];
    }

    /**
     * Get type styles from database (no merging with defaults)
     * The database is the source of truth after initial seeding
     */
    public function getTypeStyles(): array
    {
        return $this->type_styles ?? [];
    }

    public static function current(): self
    {
        // always returns the one config row
        return static::query()->firstOrCreate([], [
            'worksheet_name' => null,
            'column_map' => [],
            'type_styles' => self::defaultTypeStyles(),
        ]);
    }
}
