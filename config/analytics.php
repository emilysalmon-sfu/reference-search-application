<?php

return [

    /*
    | Referrer hosts are compared without "www.". A pattern also matches its subdomains,
    | so "google.*" covers google.ca and scholar.google.com.
    */

    'search_engines' => [
        'google.*', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'ecosia.org',
        'baidu.com', 'yandex.*', 'brave.com', 'startpage.com',
    ],

    'social' => [
        'linkedin.com', 'lnkd.in', 't.co', 'x.com', 'twitter.com', 'facebook.com', 'fb.me',
        'instagram.com', 'reddit.com', 'bsky.app', 'threads.net', 'youtube.com',
    ],

    /*
    | ISO 3166-1 alpha-2 country codes per region. Any other country is "Other".
    */

    'regions' => [
        'North America' => ['US', 'CA', 'MX'],
        'South America' => ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GS', 'GY', 'PE', 'PY', 'SR', 'UY', 'VE'],
        'Africa' => [
            'AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'CV', 'DJ', 'DZ', 'EG', 'EH', 'ER',
            'ET', 'GA', 'GH', 'GM', 'GN', 'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML', 'MR',
            'MU', 'MW', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'SC', 'SD', 'SH', 'SL', 'SN', 'SO', 'SS', 'ST',
            'SZ', 'TD', 'TG', 'TN', 'TZ', 'UG', 'YT', 'ZA', 'ZM', 'ZW',
        ],
        'Europe' => [
            'AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
            'FO', 'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM', 'IS', 'IT', 'JE', 'LI', 'LT', 'LU',
            'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SJ',
            'SK', 'SM', 'UA', 'VA', 'XK',
        ],
        'Asia' => [
            'AE', 'AF', 'AM', 'AZ', 'BD', 'BH', 'BN', 'BT', 'CN', 'GE', 'HK', 'ID', 'IL', 'IN', 'IQ', 'IR',
            'JO', 'JP', 'KG', 'KH', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK', 'MM', 'MN', 'MO', 'MV', 'MY',
            'NP', 'OM', 'PH', 'PK', 'PS', 'QA', 'SA', 'SG', 'SY', 'TH', 'TJ', 'TL', 'TM', 'TR', 'TW', 'UZ',
            'VN', 'YE',
        ],
        'Oceania' => [
            'AS', 'AU', 'CK', 'FJ', 'FM', 'GU', 'KI', 'MH', 'MP', 'NC', 'NF', 'NR', 'NU', 'NZ', 'PF', 'PG',
            'PN', 'PW', 'SB', 'TK', 'TO', 'TV', 'UM', 'VU', 'WF', 'WS',
        ],
    ],

    /*
    | Fallback bot check for user agents the device detector doesn't know.
    */

    'bot_pattern' => '/bot|crawl|spider|slurp|preview|headless|lighthouse/i',

];
