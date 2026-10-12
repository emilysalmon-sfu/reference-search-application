<?php

namespace App\Analytics;

use App\Models\AnalyticsSalt;
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
}
