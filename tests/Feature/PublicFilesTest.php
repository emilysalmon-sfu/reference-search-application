<?php

test('robots.txt points to the sitemap', function () {
    expect(file_get_contents(public_path('robots.txt')))->toContain('Sitemap: https://www.indigimos.com/sitemap.xml');
});

test('the sitemap lists the public pages', function () {
    $xml = simplexml_load_file(public_path('sitemap.xml'));

    expect(array_map(fn ($url) => (string) $url->loc, iterator_to_array($xml->url, false)))->toBe([
        'https://www.indigimos.com/', 'https://www.indigimos.com/introduction', 'https://www.indigimos.com/privacy',
    ]);
});

test('llms.txt explains the site and how to build search urls', function () {
    expect(file_get_contents(public_path('llms.txt')))
        ->toStartWith('# IndigiMOS')
        ->toContain('## Who is behind it')->toContain('## Themes')->toContain('## Searching')
        ->toContain('Salmon, Chavez & Murphy (2023)')->toContain('SSHRC')
        ->toContain('https://www.indigimos.com/articles/search?')
        ->toContain('year_from')->toContain('subtheme');
});

test('the og image is a 1200x630 png', function () {
    [$width, $height, $type] = getimagesize(public_path('og-image.png'));

    expect([$width, $height, $type])->toBe([1200, 630, IMAGETYPE_PNG]);
});

test('llms.txt lists its links as markdown links', function () {
    expect(file_get_contents(public_path('llms.txt')))
        ->toContain('](https://www.indigimos.com/)')
        ->toContain('](https://www.indigimos.com/introduction)')
        ->toContain('](https://www.indigimos.com/sitemap.xml)')
        ->toContain('](https://www.indigimos.com/articles/search?subtheme=Leadership&year_from=2015)')
        ->toContain('[Salmon, Chavez & Murphy (2023)](https://doi.org/10.5465/annals.2021.0132)');
});

test('the svg favicon is the sage and cream S, not the Laravel logo', function () {
    expect(file_get_contents(public_path('favicon.svg')))
        ->toContain('#4F6B5C')->toContain('#FAF6EF')
        ->not->toContain('M162.041 38.7592');
});

test('the apple touch icon is a 180x180 png', function () {
    [$width, $height, $type] = getimagesize(public_path('apple-touch-icon.png'));

    expect([$width, $height, $type])->toBe([180, 180, IMAGETYPE_PNG]);
});

test('the ico favicon is a 32x32 icon', function () {
    [$width, $height, $type] = getimagesize(public_path('favicon.ico'));

    expect([$width, $height, $type])->toBe([32, 32, IMAGETYPE_ICO]);
});
