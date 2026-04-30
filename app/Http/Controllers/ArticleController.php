<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArticlesQueryRequest;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\ArticleDeleteRequest;
use App\Http\Requests\ArticleUpdateRequest;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index()
    {
        try {
            $types = Article::query()
                ->whereNotNull('type_of_study')
                ->where('type_of_study', '!=', '')
                ->select('type_of_study')
                ->distinct()
                ->orderBy('type_of_study')
                ->pluck('type_of_study');
        } catch (\Exception $e) {
            $types = collect();
        }

        try {
            $themes = Article::query()
                ->whereNotNull('theme')
                ->where('theme', '!=', '')
                ->select('theme', 'sub_theme_1')
                ->orderBy('theme')
                ->orderBy('sub_theme_1')
                ->get()
                ->groupBy('theme')
                ->map(function (Collection $group, $theme) {
                    return [
                        'theme' => $theme,
                        'subthemes' => $group
                            ->pluck('sub_theme_1')
                            ->filter()
                            ->unique()
                            ->values(),
                    ];
                })
                ->values();
        } catch (\Exception $e) {
            $themes = collect();
        }

        return Inertia::render('articles', [
            'types' => $types,
            'themes' => $themes,
        ]);
    }

    public function queryArticles(ArticlesQueryRequest $request)
    {
        // $filters = $request->validated();
        $filters = $request->only([
            'author',
            'title',
            'country',
            'type_of_study',
            'year_from',
            'year_to',
            'journal',
            'keywords',
            'abstract',
            'theme',
            'sub_theme_1',
            'subtheme', // Also accept 'subtheme' for frontend compatibility
        ]);

        // Normalize subtheme field
        if (isset($filters['subtheme']) && ! isset($filters['sub_theme_1'])) {
            $filters['sub_theme_1'] = $filters['subtheme'];
        }

        $query = Article::query();
        $query->where('isApproved', true);

        // 2) Apply field-by-field filters
        if (! empty($filters['author'])) {
            $query->where('author', 'like', '%'.$filters['author'].'%');
        }

        if (! empty($filters['title'])) {
            $query->where('title', 'like', '%'.$filters['title'].'%');
        }

        if (! empty($filters['journal'])) {
            $query->where('journal_name', 'like', '%'.$filters['journal'].'%');
        }

        if (! empty($filters['country'])) {
            $query->where('country', 'like', '%'.$filters['country'].'%');
        }

        if (! empty($filters['type_of_study'])) {
            $query->where('type_of_study', 'like', '%'.$filters['type_of_study'].'%');
        }

        if (! empty($filters['keywords'])) {
            $query->where('keywords', 'like', '%'.$filters['keywords'].'%');
        }

        if (! empty($filters['abstract'])) {
            $query->where('abstract', 'like', '%'.$filters['abstract'].'%');
        }

        if (! empty($filters['theme'])) {
            $query->where('theme', 'like', '%'.$filters['theme'].'%');
        }

        if (! empty($filters['sub_theme_1'])) {
            $query->where('sub_theme_1', 'like', '%'.$filters['sub_theme_1'].'%');
        }

        // 3) Year range filter (X - Y)
        $yearFrom = $filters['year_from'] ?? null;
        $yearTo = $filters['year_to'] ?? null;

        if ($yearFrom && $yearTo) {
            $query->whereBetween('year_published', [$yearFrom, $yearTo]);
        } elseif ($yearFrom) {
            $query->where('year_published', '>=', $yearFrom);
        } elseif ($yearTo) {
            $query->where('year_published', '<=', $yearTo);
        }

        try {
            $totalArticleCount = (clone $query)->count();
        } catch (\Exception $e) {
            $totalArticleCount = 0;
        }

        try {
            $articles = $query
                ->orderBy('year_published')
                ->paginate(10)
                ->withQueryString();
        } catch (\Exception $e) {
            $articles = null;
        }

        try {
            $types = Article::query()
                ->whereNotNull('type_of_study')
                ->where('type_of_study', '!=', '')
                ->select('type_of_study')
                ->distinct()
                ->orderBy('type_of_study')
                ->pluck('type_of_study');
        } catch (\Exception $e) {
            $types = collect();
        }

        try {
            $themes = Article::query()
                ->whereNotNull('theme')
                ->where('theme', '!=', '')
                ->select('theme', 'sub_theme_1')
                ->orderBy('theme')
                ->orderBy('sub_theme_1')
                ->get()
                ->groupBy('theme')
                ->map(function (Collection $group, $theme) {
                    return [
                        'theme' => $theme,
                        'subthemes' => $group
                            ->pluck('sub_theme_1')
                            ->filter()
                            ->unique()
                            ->values(),
                    ];
                })
                ->values();
        } catch (\Exception $e) {
            $themes = collect();
        }

        return Inertia::render('articles', [
            'articles' => $articles,
            'filters' => $filters,
            'totalArticleCount' => $totalArticleCount,
            'types' => $types,
            'themes' => $themes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Articles/createArticle');
    }

    public function store(ArticleStoreRequest $request)
    {
        $validated = $request->validated();
        $validated['source'] = Article::SOURCE_ADMIN;

        Article::create($validated);

        return redirect()->route('articlesIndex')->with('success', 'Article created successfully.');
    }

    public function submitArticleForApproval(ArticleStoreRequest $request)
    {
        try {
            $validated = $request->validated();
            $validated['isApproved'] = false;
            $validated['source'] = Article::SOURCE_USER;

            Article::create($validated);

            return redirect()->back()->with('success', 'Article submited for approval. Once it\'s approved, it will be added to the list.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while submitting the article for approval.');
        }
    }

    public function list()
    {
        $perPage = request()->query('per_page', 15);
        $perPage = min($perPage, 100); // Cap at 100 for safety
        
        $articles = Article::orderBy('created_at', 'desc')->paginate($perPage);

        try {
            $types = Article::query()
                ->whereNotNull('type_of_study')
                ->where('type_of_study', '!=', '')
                ->select('type_of_study')
                ->distinct()
                ->orderBy('type_of_study')
                ->pluck('type_of_study');
        } catch (\Exception $e) {
            $types = collect();
        }

        try {
            $themes = Article::query()
                ->whereNotNull('theme')
                ->where('theme', '!=', '')
                ->select('theme', 'sub_theme_1')
                ->orderBy('theme')
                ->orderBy('sub_theme_1')
                ->get()
                ->groupBy('theme')
                ->map(function (Collection $group, $theme) {
                    return [
                        'theme' => $theme,
                        'subthemes' => $group
                            ->pluck('sub_theme_1')
                            ->filter()
                            ->unique()
                            ->values(),
                    ];
                })
                ->values();
        } catch (\Exception $e) {
            $themes = collect();
        }

        return Inertia::render('Articles/articleList', [
            'articles' => $articles,
            'types' => $types,
            'themes' => $themes,
        ]);
    }

    public function searchArticlesList(ArticlesQueryRequest $request)
    {
        $filters = $request->validated();
        $missingYear = $request->query('missing_year') === '1';

        $query = Article::query();

        // Filter for missing year if requested
        if ($missingYear) {
            $query->where(function ($q) {
                $q->whereNull('year_published')
                    ->orWhere('year_published', '');
            });
        }

        // Check if at least one filter has a value
        $hasFilters = false;
        foreach ($filters as $value) {
            if (!empty($value)) {
                $hasFilters = true;
                break;
            }
        }

        // Only apply where clause if we have at least one filter
        if ($hasFilters) {
            $query->where(function ($q) use ($filters) {
                if (! empty($filters['author'])) {
                    $q->orWhere('author', 'like', '%'.$filters['author'].'%');
                }

                if (! empty($filters['title'])) {
                    $q->orWhere('title', 'like', '%'.$filters['title'].'%');
                }

                if (! empty($filters['journal'])) {
                    $q->orWhere('journal_name', 'like', '%'.$filters['journal'].'%');
                }

                if (! empty($filters['keywords'])) {
                    $q->orWhere('keywords', 'like', '%'.$filters['keywords'].'%');
                }
            });
        }

        $perPage = $request->query('per_page', 15);
        $perPage = min($perPage, 100); // Cap at 100 for safety

        try {
            $articles = $query
                ->orderBy('created_at', 'desc')
                ->paginate($perPage)
                ->withQueryString();
        } catch (\Exception $e) {
            $articles = collect();
        }

        try {
            $types = Article::query()
                ->whereNotNull('type_of_study')
                ->where('type_of_study', '!=', '')
                ->select('type_of_study')
                ->distinct()
                ->orderBy('type_of_study')
                ->pluck('type_of_study');
        } catch (\Exception $e) {
            $types = collect();
        }

        try {
            $themes = Article::query()
                ->whereNotNull('theme')
                ->where('theme', '!=', '')
                ->select('theme', 'sub_theme_1')
                ->orderBy('theme')
                ->orderBy('sub_theme_1')
                ->get()
                ->groupBy('theme')
                ->map(function (Collection $group, $theme) {
                    return [
                        'theme' => $theme,
                        'subthemes' => $group
                            ->pluck('sub_theme_1')
                            ->filter()
                            ->unique()
                            ->values(),
                    ];
                })
                ->values();
        } catch (\Exception $e) {
            $themes = collect();
        }

        return Inertia::render('Articles/articleList', [
            'articles' => $articles,
            'types' => $types,
            'themes' => $themes,
        ]);
    }

    public function destroy(ArticleDeleteRequest $request, Article $article)
    {
        try {
            $article->delete();

            return redirect()->back()->with('success', 'Article deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while deleting the article.');
        }
    }

    public function update(ArticleUpdateRequest $request, Article $article)
    {
        try {
            $validated = $request->validated();

            $article->update($validated);

            return redirect()->back()->with('success', 'Article updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while updating the article.');
        }
    }

    public function storeFromAdmin(ArticleUpdateRequest $request)
    {
        try {
            $validated = $request->validated();
            $validated['isApproved'] = true;
            $validated['source'] = Article::SOURCE_ADMIN;

            Article::create($validated);

            return redirect()->back()->with('success', 'Article created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while creating the article.');
        }
    }

    /**
     * Search for journal names matching a query string.
     * Used for autocomplete/typeahead functionality.
     */
    public function searchJournalNames(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        try {
            $journalNames = Article::query()
                ->whereNotNull('journal_name')
                ->where('journal_name', '!=', '')
                ->where('journal_name', 'like', '%' . $query . '%')
                ->select('journal_name')
                ->distinct()
                ->orderByRaw("CASE WHEN journal_name LIKE ? THEN 0 ELSE 1 END", [$query . '%'])
                ->orderBy('journal_name')
                ->limit(15)
                ->pluck('journal_name');

            return response()->json($journalNames);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }
}
