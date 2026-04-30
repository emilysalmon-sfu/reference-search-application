<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArticleApproveRequest;
use App\Http\Requests\ArticleDeleteRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    /**
     * Display a listing of articles pending approval.
     */
    public function index(): Response
    {
        $articles = Article::where('isApproved', false)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

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

        return Inertia::render('Approvals/approvals', [
            'articles' => $articles,
            'types' => $types,
            'themes' => $themes,
        ]);
    }

    /**
     * Approve an article and update its data.
     */
    public function approve(ArticleApproveRequest $request, Article $article): RedirectResponse
    {
        try {
            $validated = $request->validated();
            $validated['isApproved'] = true;

            $article->update($validated);

            return redirect()->back()->with('success', 'Article approved successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while approving the article.');
        }
    }

    /**
     * Reject (delete) an article pending approval.
     */
    public function reject(ArticleDeleteRequest $request, Article $article): RedirectResponse
    {
        try {
            $article->delete();

            return redirect()->back()->with('success', 'Article rejected and removed.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while rejecting the article.');
        }
    }
}
