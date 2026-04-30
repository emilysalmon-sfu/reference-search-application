<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'author' => $this->faker->name(),
            'title' => $this->faker->sentence(5),
            'year_published' => $this->faker->year(),
            'journal_name' => $this->faker->words(3, true),
            'keywords' => implode(',', $this->faker->words(5)),
            'abstract' => $this->faker->paragraph(8),
        ];
    }
}
