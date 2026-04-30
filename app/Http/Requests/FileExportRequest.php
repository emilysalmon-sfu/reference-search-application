<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileExportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'author' => 'nullable',
            'title' => 'nullable',
            'journal' => 'nullable',
            'keywords' => 'nullable',
            'abstract' => 'nullable',
            'year_from' => 'nullable',
            'year_to' => 'nullable',
            'theme' => 'nullable',
            'sub_theme_1' => 'nullable',
            'country' => 'nullable',
            'type_of_study' => 'nullable',
            'doi' => 'nullable',
        ];
    }
}
