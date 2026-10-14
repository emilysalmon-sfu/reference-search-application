<?php

namespace App\Rules;

use App\Models\Article;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueDoi implements ValidationRule
{
    /**
     * @param  int|null  $ignoreId  Article to exclude from the check (the one being edited/approved).
     */
    public function __construct(private ?int $ignoreId = null)
    {
    }

    /**
     * Fails when the value isn't a DOI, or another article (approved or pending) already has it.
     * Runs before the database's unique index so users get a readable message.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $doi = Article::normalizeDoi($value);

        if ($doi === null) {
            if (trim((string) $value) !== '') {
                $fail('This is not a valid DOI.');
            }

            return;
        }

        $existing = Article::query()
            ->where('doi', $doi)
            ->when($this->ignoreId, fn ($query) => $query->whereKeyNot($this->ignoreId))
            ->first(['id', 'isApproved']);

        if (! $existing) {
            return;
        }

        $fail($existing->isApproved
            ? 'An article with this DOI already exists.'
            : 'An article with this DOI is already awaiting approval.');
    }
}
