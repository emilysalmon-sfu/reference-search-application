<?php

// Temporary: shows what the app sees of a request behind Laravel Cloud's edge, to set trustProxies.

test('only admins can open the request check', function () {
    $this->get('/admin/request-check')->assertRedirect(route('login'));

    $this->actingAs(approver())
        ->get('/admin/request-check')
        ->assertRedirect('/admin/dashboard');
});

test('the request check shows the client ip and the proxy headers', function () {
    $this->actingAs(admin())
        ->withHeaders([
            'X-Forwarded-For' => '203.0.113.7, 10.0.0.2',
            'X-Forwarded-Proto' => 'https',
            'X-Real-IP' => '203.0.113.7',
            'CF-Connecting-IP' => '203.0.113.7',
            'True-Client-IP' => '203.0.113.7',
            'CF-IPCountry' => 'CA',
        ])
        ->get('/admin/request-check', ['REMOTE_ADDR' => '10.0.0.9'])
        ->assertOk()
        ->assertExactJson([
            'ip' => '10.0.0.9',
            'ips' => ['10.0.0.9'],
            'remote_addr' => '10.0.0.9',
            'x-forwarded-for' => '203.0.113.7, 10.0.0.2',
            'x-forwarded-proto' => 'https',
            'x-real-ip' => '203.0.113.7',
            'cf-connecting-ip' => '203.0.113.7',
            'true-client-ip' => '203.0.113.7',
            'cf-ipcountry' => 'CA',
        ]);
});
