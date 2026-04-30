<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleExportInfo;
use App\Models\ArticleImportUpload;
use App\Models\Feedback;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $latestUpload = ArticleImportUpload::latest()->first();
        $unresolvedFeedbacks = Feedback::where('isResolved', false)->count();
    
        return Inertia::render('dashboard', [
            // Static stats
            'pendingApprovalsCount' => Article::where('isApproved', false)->count(),
            'unresolvedFeedbacksCount' => $unresolvedFeedbacks,
            'lastImportedFileDate' => $latestUpload
                ? Carbon::parse($latestUpload->date)->format('d M Y')
                : null,
            'articlesCreated' => $latestUpload ? $latestUpload->articlesCreated : 0,
            'articlesWithoutYear' => Article::where('isApproved', true)
                ->where(function ($query) {
                    $query->whereNull('year_published')
                        ->orWhere('year_published', '');
                })
                ->count(),
            'totalArticlesCount' => Article::count()
        ]);
    }

    /**
     * API endpoint to get time-filtered statistics
     */
    public function getFilteredStats(Request $request)
    {
        $period = $request->query('period', 'all');
        $startDate = $this->getStartDateForPeriod($period);

        // Downloads count (from article_export_infos)
        $downloadsQuery = ArticleExportInfo::query();
        if ($startDate) {
            $downloadsQuery->where('date', '>=', $startDate);
        }
        $downloadsCount = $downloadsQuery->sum('count');

        // Articles added by users (source = 'user', approved)
        $userArticlesQuery = Article::where('source', Article::SOURCE_USER)
            ->where('isApproved', true);
        if ($startDate) {
            $userArticlesQuery->where('created_at', '>=', $startDate);
        }
        $userArticlesCount = $userArticlesQuery->count();

        // Articles added by admin (source = 'admin')
        $adminArticlesQuery = Article::where('source', Article::SOURCE_ADMIN);
        if ($startDate) {
            $adminArticlesQuery->where('created_at', '>=', $startDate);
        }
        $adminArticlesCount = $adminArticlesQuery->count();

        return response()->json([
            'downloadsCount' => $downloadsCount,
            'userArticlesCount' => $userArticlesCount,
            'adminArticlesCount' => $adminArticlesCount,
        ]);
    }

    /**
     * Calculate start date based on period string
     */
    private function getStartDateForPeriod(string $period): ?Carbon
    {
        return match ($period) {
            '24h' => Carbon::now()->subDay(),
            '48h' => Carbon::now()->subDays(2),
            'week' => Carbon::now()->subWeek(),
            'month' => Carbon::now()->subMonth(),
            '3months' => Carbon::now()->subMonths(3),
            '6months' => Carbon::now()->subMonths(6),
            'year' => Carbon::now()->subYear(),
            default => null, // 'all' - no date filter
        };
    }
}
