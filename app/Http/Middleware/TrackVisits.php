<?php

namespace App\Http\Middleware;

use App\Analytics\Analytics;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Records visits to the public pages after the response has been sent,
 * so tracking never slows a page down or adds anything to the response.
 */
class TrackVisits
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! $this->isPublicPageView($request, $response)) {
            return;
        }

        try {
            $visit = Analytics::currentVisit($request);
            $search = $request->attributes->get('analytics.search');

            if ($visit && $search) {
                Analytics::logSearch($visit, $search['filters'], $search['count']);
            }
        } catch (Throwable $e) {
            report($e);
        }
    }

    /**
     * A logged-out GET of a public page that rendered, excluding Inertia partial reloads and prefetches.
     */
    private function isPublicPageView(Request $request, Response $response): bool
    {
        return $request->isMethod('GET')
            && $response->isSuccessful()
            && ! $request->user()
            && $request->routeIs('articlesIndex', 'queryArticles', 'introduction', 'privacy')
            && ! $request->hasHeader('X-Inertia-Partial-Data')
            && ! str_contains($request->header('Purpose', '').$request->header('Sec-Purpose', ''), 'prefetch');
    }
}
