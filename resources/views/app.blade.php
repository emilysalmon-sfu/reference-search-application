@php($seo = config('site.pages.'.$page['component']))
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ $seo['title'] ?? config('site.title') }}</title>
        @if ($seo)
            @include('partials.seo')
        @endif
        @if (config('site.google_site_verification'))
            <meta name="google-site-verification" content="{{ config('site.google_site_verification') }}">
        @endif

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&amp;display=swap" rel="stylesheet" />

        @if ($page['component'] === 'articles')
            {{-- The framework image is the search page's largest element: fetch it before the JavaScript renders it. --}}
            <link rel="preload" as="image" href="{{ Vite::asset('resources/js/assets/framework-image.webp') }}" fetchpriority="high">
        @endif

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- What @inertia renders (no SSR), plus a static heading for crawlers that don't run JavaScript. React replaces it on mount. --}}
        <div id="app" data-page="{{ json_encode($page) }}">@if ($seo)<h1>{{ $seo['title'] }}</h1><p>{{ $seo['description'] }}</p>@endif</div>
    </body>
</html>
