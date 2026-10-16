<?php

test('the home page html carries seo metadata without javascript', function () {
    expect($this->get('/')->assertOk()->getContent())
        ->toContain('<title inertia>IndigiMOS: Indigenous Management &amp; Organizational Studies Research Database</title>')
        ->toContain('<meta name="description" content="')
        ->toContain('<link rel="canonical" href="http://localhost">')
        ->toContain('<meta property="og:title" content="IndigiMOS: Indigenous Management &amp; Organizational Studies Research Database">')
        ->toContain('<meta property="og:image" content="http://localhost/og-image.png">')
        ->toContain('<meta name="twitter:card" content="summary_large_image">')
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

test('public pages show nothing before the app draws them', function () {
    foreach (['/', '/introduction', '/privacy'] as $page) {
        expect($this->get($page)->getContent())->toMatch('/<div id="app" data-page="[^"]*"><\/div>/');
    }
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

test('fonts load with font-display swap', function () {
    expect($this->get('/')->getContent())
        ->toContain('https://fonts.bunny.net/css?family=instrument-sans:400,500,600&amp;display=swap');
});

test('the search page preloads its framework image at high priority', function () {
    // The suite's Vite fake returns "" for every URL; wrap it so asset() echoes the path it was asked for.
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

    expect($this->get('/')->getContent())
        ->toContain('<link rel="preload" as="image" href="/build/resources/js/assets/framework-image.webp" fetchpriority="high">');

    expect($this->get('/introduction')->getContent())->not->toContain('rel="preload" as="image"');
});
