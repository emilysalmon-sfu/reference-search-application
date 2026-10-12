<?php

namespace App\Analytics;

use App\Models\AnalyticsSalt;
use App\Models\AnalyticsVisit;
use DeviceDetector\DeviceDetector;
use Illuminate\Http\Request;

/**
 * Cookie-free usage analytics. The IP and user agent are only used in memory, never stored.
 */
class Analytics
{
    public const TIMEZONE = 'America/Vancouver';

    /**
     * sha256(daily salt + ip + user agent). The salt changes every Vancouver day and old
     * salts are deleted, so the same visitor can't be linked across days.
     */
    public static function visitorHash(Request $request): string
    {
        $salt = AnalyticsSalt::firstOrCreate(
            ['date' => now(self::TIMEZONE)->toDateString()],
            ['salt' => bin2hex(random_bytes(32))],
        );

        if ($salt->wasRecentlyCreated) {
            AnalyticsSalt::where('date', '<', $salt->date)->delete();
        }

        return hash('sha256', $salt->salt.$request->ip().$request->userAgent());
    }

    /**
     * The visitor's current visit: the one seen in the last 30 minutes (now touched), or a new one.
     * Null for bots, which are never counted.
     */
    public static function currentVisit(Request $request): ?AnalyticsVisit
    {
        $device = self::device($request->userAgent());

        if ($device === null) {
            return null;
        }

        $hash = self::visitorHash($request);

        // ponytail: two simultaneous first requests can both start a visit; harmless at this traffic.
        $visit = AnalyticsVisit::where('visitor_hash', $hash)
            ->where('last_seen_at', '>=', now()->subMinutes(30))
            ->latest('last_seen_at')
            ->first();

        if ($visit) {
            $visit->update(['last_seen_at' => now()]);

            return $visit;
        }

        $country = self::country($request);

        return AnalyticsVisit::create([
            ...self::source($request),
            'visitor_hash' => $hash,
            'started_at' => now(),
            'last_seen_at' => now(),
            'country_code' => $country,
            'region' => self::region($country),
            'device_type' => $device,
            'landing_path' => '/'.ltrim($request->path(), '/'),
        ]);
    }

    /**
     * Where the visitor came from: a tagged campaign, a search engine, social media,
     * another website (host only), or direct (no referrer, or a link inside this site).
     *
     * @return array{source_type: string, source_host: ?string, utm_source: ?string, utm_medium: ?string, utm_campaign: ?string}
     */
    public static function source(Request $request): array
    {
        $source = ['source_type' => 'direct', 'source_host' => null, 'utm_source' => null, 'utm_medium' => null, 'utm_campaign' => null];

        if ($request->filled('utm_source')) {
            return [
                ...$source,
                'source_type' => 'campaign',
                'utm_source' => self::queryString($request, 'utm_source'),
                'utm_medium' => self::queryString($request, 'utm_medium'),
                'utm_campaign' => self::queryString($request, 'utm_campaign'),
            ];
        }

        $host = self::host($request->headers->get('referer'));

        if ($host === null || $host === self::host($request->root())) {
            return $source;
        }

        $type = match (true) {
            self::hostMatches($host, config('analytics.search_engines')) => 'search',
            self::hostMatches($host, config('analytics.social')) => 'social',
            default => 'website',
        };

        return [...$source, 'source_type' => $type, 'source_host' => $host];
    }

    /**
     * "desktop", "mobile" or "tablet". Null for bots and requests without a user agent.
     */
    public static function device(?string $userAgent): ?string
    {
        if (blank($userAgent) || preg_match(config('analytics.bot_pattern'), $userAgent)) {
            return null;
        }

        $detector = new DeviceDetector($userAgent);
        $detector->parse();

        return match (true) {
            $detector->isBot() => null,
            $detector->isTablet() => 'tablet',
            $detector->isMobile() => 'mobile',
            default => 'desktop',
        };
    }

    /**
     * The visitor's country from Cloudflare's CF-IPCountry header. Null when Cloudflare
     * doesn't know it ("XX"), for Tor ("T1"), or when the site isn't behind Cloudflare.
     */
    public static function country(Request $request): ?string
    {
        $country = strtoupper((string) $request->header('CF-IPCountry'));

        return preg_match('/^[A-Z]{2}$/', $country) && $country !== 'XX' ? $country : null;
    }

    public static function region(?string $country): ?string
    {
        if ($country === null) {
            return null;
        }

        foreach (config('analytics.regions') as $region => $countries) {
            if (in_array($country, $countries, true)) {
                return $region;
            }
        }

        return 'Other';
    }

    private static function host(?string $url): ?string
    {
        $host = parse_url((string) $url, PHP_URL_HOST);

        return $host ? preg_replace('/^www\./', '', strtolower($host)) : null;
    }

    private static function hostMatches(string $host, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (fnmatch($pattern, $host) || fnmatch('*.'.$pattern, $host)) {
                return true;
            }
        }

        return false;
    }

    private static function queryString(Request $request, string $key): ?string
    {
        $value = $request->query($key);

        return is_string($value) && $value !== '' ? mb_substr($value, 0, 255) : null;
    }
}
