{{-- Rendered server-side for public pages (config/site.php), so crawlers see it without JavaScript. --}}
<meta name="description" content="{{ $seo['description'] }}">
<link rel="canonical" href="{{ url()->current() }}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{{ config('site.name') }}">
<meta property="og:title" content="{{ $seo['title'] }}">
<meta property="og:description" content="{{ $seo['description'] }}">
<meta property="og:url" content="{{ url()->current() }}">
<meta property="og:image" content="{{ asset('og-image.png') }}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $seo['title'] }}">
<meta name="twitter:description" content="{{ $seo['description'] }}">
<meta name="twitter:image" content="{{ asset('og-image.png') }}">
@if (request()->is('/'))
    @php
        $jsonLd = [
        '@context' => 'https://schema.org',
        '@graph' => [
            [
                '@type' => 'WebSite',
                'name' => config('site.title'),
                'url' => url('/'),
                'potentialAction' => [
                    '@type' => 'SearchAction',
                    'target' => ['@type' => 'EntryPoint', 'urlTemplate' => url('/articles/search').'?keywords={search_term_string}'],
                    'query-input' => 'required name=search_term_string',
                ],
            ],
            [
                '@type' => 'Dataset',
                'name' => config('site.title'),
                'description' => config('site.description'),
                'url' => url('/'),
                'isBasedOn' => 'https://doi.org/10.5465/annals.2021.0132',
                'keywords' => config('site.themes'),
                'funder' => ['@type' => 'Organization', 'name' => 'Social Sciences and Humanities Research Council of Canada (SSHRC)', 'url' => 'https://www.sshrc-crsh.gc.ca'],
            ],
            [
                '@type' => 'Organization',
                'name' => config('site.name'),
                'url' => url('/'),
                'logo' => asset('logo.png'),
            ],
        ],
        ];
    @endphp
    <script type="application/ld+json">{!! json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
@endif
