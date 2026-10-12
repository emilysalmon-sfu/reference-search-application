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
        ->toContain('"urlTemplate":"http://localhost/articles/search?keywords={search_term_string}"');
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
