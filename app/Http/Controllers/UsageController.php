<?php

namespace App\Http\Controllers;

use App\Analytics\Analytics;
use App\Analytics\UsageReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsageController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Usage/index', [
            'report' => $this->report($request)->toArray(),
        ]);
    }

    /**
     * The requested range of Vancouver dates, or the last 30 days.
     */
    private function report(Request $request): UsageReport
    {
        $range = $request->validate([
            'from' => ['nullable', 'required_with:to', 'date_format:Y-m-d'],
            'to' => ['nullable', 'required_with:from', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $today = now(Analytics::TIMEZONE);

        return UsageReport::forRange(
            $range['from'] ?? $today->copy()->subDays(29)->toDateString(),
            $range['to'] ?? $today->toDateString(),
        );
    }
}
