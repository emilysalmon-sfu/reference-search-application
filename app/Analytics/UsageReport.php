<?php

namespace App\Analytics;

use App\Models\AnalyticsSearch;
use App\Models\AnalyticsVisit;
use App\Models\ArticleExportInfo;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

/**
 * Every number on the Usage page and in its Excel export, for a range of Vancouver dates
 * (both ends included) compared with the period of the same length just before it.
 *
 * ponytail: rows are aggregated in PHP so the code runs the same on MySQL and SQLite;
 * move to SQL GROUP BY if one range ever holds more than ~100k visits or searches.
 */
class UsageReport
{
    private const METRICS = [
        'visits' => 'Visits',
        'searches' => 'Searches',
        'searches_per_visit' => 'Searches per visit',
        'zero_result_searches' => 'Zero-result searches',
        'downloads' => 'Downloads',
        'countries' => 'Countries reached',
    ];

    /** The public search form's field labels, in the form's order. */
    private const SEARCH_FIELDS = [
        'author' => 'Author',
        'title' => 'Title',
        'journal' => 'Journal',
        'keywords' => 'Keywords',
        'country' => 'Country',
        'type_of_study' => 'Type of Study',
        'theme' => 'Theme',
        'sub_theme_1' => 'Subtheme',
        'year_from' => 'Year From',
        'year_to' => 'Year To',
        'abstract' => 'Abstract',
    ];

    private function __construct(private CarbonImmutable $from, private CarbonImmutable $to)
    {
    }

    /**
     * @param  string  $from  Y-m-d, Vancouver time
     * @param  string  $to  Y-m-d, Vancouver time
     */
    public static function forRange(string $from, string $to): self
    {
        return new self(
            CarbonImmutable::parse($from, Analytics::TIMEZONE)->startOfDay(),
            CarbonImmutable::parse($to, Analytics::TIMEZONE)->startOfDay(),
        );
    }

    public function toArray(): array
    {
        $days = (int) $this->from->diffInDays($this->to) + 1;
        $previousFrom = $this->from->subDays($days);
        $previousTo = $this->from->subDay();

        $visits = $this->visits($this->from, $this->to);
        $searches = $this->searches($this->from, $this->to);
        $current = $this->totals($visits, $searches, $this->downloads($this->from, $this->to));
        $previous = $this->totals(
            $this->visits($previousFrom, $previousTo),
            $this->searches($previousFrom, $previousTo),
            $this->downloads($previousFrom, $previousTo),
        );

        return [
            'from' => $this->from->toDateString(),
            'to' => $this->to->toDateString(),
            'previous_from' => $previousFrom->toDateString(),
            'previous_to' => $previousTo->toDateString(),
            'summary' => collect(self::METRICS)->map(fn (string $metric, string $key) => [
                'key' => $key,
                'metric' => $metric,
                'current' => $current[$key],
                'previous' => $previous[$key],
                'change' => $previous[$key] ? (int) round(($current[$key] - $previous[$key]) / $previous[$key] * 100) : null,
            ])->values()->all(),
            'visits_over_time' => $this->perDay($visits, 'started_at', 'visits'),
            'searches_over_time' => $this->perDay($searches, 'searched_at', 'searches'),
            'regions' => $this->tally($visits, fn ($visit) => $visit->region ?? 'Unknown', 'region'),
            'countries' => $this->tally($visits->whereNotNull('country_code'), 'country_code', 'country_code'),
            'source_types' => $this->tally($visits, 'source_type', 'source_type'),
            'referrers' => $this->tally($visits->whereNotNull('source_host'), 'source_host', 'host'),
            'campaigns' => $visits->where('source_type', 'campaign')
                ->groupBy(fn ($visit) => json_encode([$visit->utm_source, $visit->utm_medium, $visit->utm_campaign]))
                ->map(fn (Collection $group) => [
                    'utm_source' => $group[0]->utm_source,
                    'utm_medium' => $group[0]->utm_medium,
                    'utm_campaign' => $group[0]->utm_campaign,
                    'visits' => $group->count(),
                ])
                ->sortByDesc('visits')->values()->all(),
            'parameters' => $this->parameters($searches),
            'zero_result_searches' => $searches->where('result_count', 0)
                ->groupBy('params')
                ->map(fn (Collection $group, string $params) => [
                    'filters' => collect($this->inFormOrder(json_decode($params, true)))
                        ->map(fn ($value, $key) => ['label' => self::SEARCH_FIELDS[$key] ?? $key, 'value' => $value])
                        ->values()->all(),
                    'url' => $this->searchUrl(json_decode($params, true)),
                    'count' => $group->count(),
                    'last_searched' => $group->max('searched_at')->setTimezone(Analytics::TIMEZONE)->format('Y-m-d H:i'),
                ])
                ->sortByDesc('count')->values()->all(),
            // The dashboard shows desktop vs. mobile; tablets count as mobile.
            'devices' => $this->tally($visits, fn ($visit) => $visit->device_type === 'desktop' ? 'desktop' : 'mobile', 'device'),
        ];
    }

    private function totals(Collection $visits, Collection $searches, int $downloads): array
    {
        return [
            'visits' => $visits->count(),
            'searches' => $searches->count(),
            'searches_per_visit' => $visits->isEmpty() ? 0.0 : round($searches->count() / $visits->count(), 2),
            'zero_result_searches' => $searches->where('result_count', 0)->count(),
            'downloads' => $downloads,
            'countries' => $visits->whereNotNull('country_code')->unique('country_code')->count(),
        ];
    }

    private function visits(CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        return AnalyticsVisit::whereBetween('started_at', [$from->utc(), $to->endOfDay()->utc()])
            ->get(['started_at', 'country_code', 'region', 'source_type', 'source_host', 'utm_source', 'utm_medium', 'utm_campaign', 'device_type']);
    }

    private function searches(CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        return AnalyticsSearch::whereBetween('searched_at', [$from->utc(), $to->endOfDay()->utc()])
            ->get(['params', 'result_count', 'searched_at']);
    }

    /**
     * Download counts are already kept per Vancouver day.
     */
    private function downloads(CarbonImmutable $from, CarbonImmutable $to): int
    {
        return (int) ArticleExportInfo::whereDate('date', '>=', $from->toDateString())
            ->whereDate('date', '<=', $to->toDateString())
            ->sum('count');
    }

    /**
     * One row per day of the range, days without rows included.
     */
    private function perDay(Collection $rows, string $column, string $label): array
    {
        $counts = $rows->countBy(fn ($row) => $row->{$column}->setTimezone(Analytics::TIMEZONE)->toDateString());

        return collect(CarbonPeriod::create($this->from, $this->to))
            ->map(fn ($day) => ['date' => $day->toDateString(), $label => $counts[$day->toDateString()] ?? 0])
            ->all();
    }

    /**
     * Visits counted per value, most first.
     */
    private function tally(Collection $visits, string|callable $by, string $label): array
    {
        return $visits->countBy($by)->sortDesc()
            ->map(fn (int $count, string $value) => [$label => $value, 'visits' => $count])
            ->values()->all();
    }

    /**
     * How often each parameter value was searched, grouped by parameter.
     */
    private function parameters(Collection $searches): array
    {
        return $searches
            ->flatMap(fn ($search) => collect(json_decode($search->params, true))->map(fn ($value, $key) => "{$key}\0{$value}")->values())
            ->countBy()
            ->map(function (int $count, string $pair) {
                [$parameter, $value] = explode("\0", $pair, 2);

                return ['parameter' => $parameter, 'label' => self::SEARCH_FIELDS[$parameter] ?? $parameter, 'value' => $value, 'count' => $count];
            })
            ->sortBy([
                fn ($a, $b) => $this->formPosition($a['parameter']) <=> $this->formPosition($b['parameter']),
                fn ($a, $b) => $b['count'] <=> $a['count'],
            ])
            ->values()->all();
    }

    /**
     * Search params sorted the way the search form lists its fields.
     */
    private function inFormOrder(array $params): array
    {
        uksort($params, fn ($a, $b) => $this->formPosition($a) <=> $this->formPosition($b));

        return $params;
    }

    /**
     * The public search URL for these params. The form reads its subtheme from "subtheme"
     * (stored as "sub_theme_1"), so a link with "sub_theme_1" would leave that dropdown empty.
     */
    private function searchUrl(array $params): string
    {
        $query = [];

        foreach ($this->inFormOrder($params) as $field => $value) {
            $query[$field === 'sub_theme_1' ? 'subtheme' : $field] = $value;
        }

        return '/articles/search?'.http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    }

    private function formPosition(string $field): int
    {
        $position = array_search($field, array_keys(self::SEARCH_FIELDS), true);

        return $position === false ? PHP_INT_MAX : $position;
    }
}
