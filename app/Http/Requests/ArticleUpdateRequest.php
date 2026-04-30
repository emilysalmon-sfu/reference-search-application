<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArticleUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('keywords') && is_string($this->keywords)) {
            $keywordsRaw = (string) $this->keywords;
            $keywords = collect(preg_split("/[\r\n,;]+/", $keywordsRaw))
                ->map(fn ($k) => trim($k))
                ->filter()
                ->unique()
                ->values()
                ->all();

            $this->merge([
                'keywords' => $keywords,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'author' => 'required|string|max:255',
            'title' => 'required|string',
            'year_published' => 'nullable|date_format:Y',
            'journal_name' => 'required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string',
            'abstract' => 'nullable|string',
            'doi' => 'nullable|string|max:255',
            'theme' => 'nullable|string|max:255',
            'sub_theme_1' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'type_of_study' => 'nullable|string|max:255',
        ];
    }
}
