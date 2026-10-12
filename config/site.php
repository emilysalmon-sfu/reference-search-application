<?php

/*
| Public-facing name and per-page metadata, rendered into the initial HTML (resources/views/app.blade.php)
| so search engines and AI crawlers see it without running JavaScript.
| The client-side title template in resources/js/app.tsx mirrors these titles.
*/

return [

    'name' => 'IndigiMOS',

    'title' => 'IndigiMOS: Indigenous Management & Organizational Studies Research Database',

    'description' => 'A living, searchable database of Indigenous Management and Organizational Studies research, organized with the Salmon, Chavez & Murphy (2023) framework to help students, scholars and practitioners find and connect Indigenous-focused scholarship.',

    // Keyed by Inertia page component. Only these pages get canonical, Open Graph and the static H1.
    'pages' => [
        'articles' => [
            'title' => 'IndigiMOS: Indigenous Management & Organizational Studies Research Database',
            'description' => 'A living, searchable database of Indigenous Management and Organizational Studies research, organized with the Salmon, Chavez & Murphy (2023) framework to help students, scholars and practitioners find and connect Indigenous-focused scholarship.',
        ],
        'introduction' => [
            'title' => 'Introduction | IndigiMOS',
            'description' => 'What the IndigiMOS database is, what its name Shelh tst, kws t\'akw\' tst means, and the framework of themes and subthemes used to organize Indigenous management research.',
        ],
        'privacy' => [
            'title' => 'Privacy | IndigiMOS',
            'description' => 'The anonymous usage statistics IndigiMOS collects, and what it does not collect.',
        ],
    ],

    'themes' => ['Indigenous Ways of Being', 'Indigenous Organizing', 'Indigenous Relating', 'Academic Implications'],

    'google_site_verification' => env('GOOGLE_SITE_VERIFICATION'),

];
