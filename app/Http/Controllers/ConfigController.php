<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfigUpdateRequest;
use App\Models\Article;
use App\Models\Config;
use Exception;
use Inertia\Inertia;

class ConfigController extends Controller
{
    public function show()
    {
        $config = Config::current();
        
        // Get all unique types from articles
        $existingTypes = Article::query()
            ->whereNotNull('type_of_study')
            ->where('type_of_study', '!=', '')
            ->select('type_of_study')
            ->distinct()
            ->orderBy('type_of_study')
            ->pluck('type_of_study')
            ->toArray();

        return Inertia::render('Config/config', [
            'config' => $config,
            'existingTypes' => $existingTypes,
            'defaultTypeStyles' => Config::defaultTypeStyles(),
        ]);
    }

    public function update(ConfigUpdateRequest $request)
    {
        try {
            $data = $request->validate([
                'worksheet_name' => 'nullable|string',
                'column_map' => 'nullable|array',
                'type_styles' => 'nullable|array',
            ]);

            $config = Config::current();
            $config->update($data);

            return redirect()->back()->with('success', 'The settings were updated successfully!');

        } catch (Exception $e) {
            return redirect()->back()->with('error', 'There was an error updating the settings. Error: '.$e->getMessage());
        }
    }
}
