<?php

test('the home page html carries seo metadata without javascript', function () {
    expect($this->get('/')->assertOk()->getContent())
        ->toContain('<title inertia>IndigiMOS: Indigenous Management &amp; Organizational Studies Research Database</title>')
        ->toContain('<meta name="description" content="')
        ->toContain('<link rel="canonical" href="http://localhost">')
        ->toContain('<meta property="og:title" content="IndigiMOS: Indigenous Management &amp; Organizational Studies Research Database">')
        ->toContain('<meta property="og:image" content="http://localhost/og-image.png">')
        ->toContain('<meta name="twitter:card" content="summary_large_image">')
        ->toContain('<h1>IndigiMOS: Indigenous Management &amp; Organizational Studies Research Database</h1>')
        ->toContain('"@type":"WebSite"')->toContain('"@type":"Dataset"')->toContain('"@type":"Organization"')
        ->toContain('"urlTemplate":"http://localhost/articles/search?keywords={search_term_string}"')
        ->toContain('"logo":"http://localhost/logo.png"');
});

test('other public pages get their own title and canonical but no json-ld', function () {
    expect($this->get('/introduction')->getContent())
        ->toContain('<title inertia>Introduction | IndigiMOS</title>')
        ->toContain('<link rel="canonical" href="http://localhost/introduction">')
        ->not->toContain('application/ld+json');
});

test('admin pages get no public metadata', function () {
    expect($this->actingAs(admin())->get('/admin/dashboard')->getContent())
        ->not->toContain('rel="canonical"')->not->toContain('og:title');
});

test('the search console tag renders only when configured', function () {
    expect($this->get('/')->getContent())->not->toContain('google-site-verification');

    config(['site.google_site_verification' => 'abc123']);

    expect($this->get('/')->getContent())->toContain('<meta name="google-site-verification" content="abc123">');
});

/**
 * The suite's Vite fake returns "" for every URL; wrap it so asset() echoes the path it was asked for.
 */
function echoViteAssetPaths(): void
{
    Illuminate\Support\Facades\Vite::swap(new class(app(Illuminate\Foundation\Vite::class))
    {
        public function __construct(private object $fake)
        {
        }

        public function asset(string $asset): string
        {
            return '/build/'.$asset;
        }

        public function __invoke(...$arguments)
        {
            return ($this->fake)(...$arguments);
        }

        public function __call($method, $parameters)
        {
            return $this->fake->{$method}(...$parameters);
        }
    });
}

test('the font is served from the site itself and preloaded on every page', function () {
    echoViteAssetPaths();

    foreach (['/', '/introduction', '/privacy'] as $page) {
        expect($this->get($page)->getContent())
            ->not->toContain('fonts.bunny.net')
            ->toContain('<link rel="preload" as="font" type="font/woff2" href="/build/resources/fonts/instrument-sans-latin-wght-normal.woff2" crossorigin>');
    }
});

test('the search page preloads its framework image at high priority', function () {
    echoViteAssetPaths();

    expect($this->get('/')->getContent())
        ->toContain('<link rel="preload" as="image" href="/build/resources/js/assets/framework-image.webp" fetchpriority="high">');

    expect($this->get('/introduction')->getContent())->not->toContain('rel="preload" as="image"');
});
