<?php

use App\Models\Config;
use Inertia\Testing\AssertableInertia as Assert;

test('the public pages render', function (string $uri, string $component) {
    $this->get($uri)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'articles' => ['/', 'articles'],
    'introduction' => ['/introduction', 'introduction'],
]);

test('the documentation page is for signed-in users', function () {
    $this->get('/admin/documentation')->assertRedirect(route('login'));

    $this->actingAs(approver())
        ->get('/admin/documentation')
        ->assertInertia(fn (Assert $page) => $page->component('Documentation/index'));
});

test('every page receives the shared data', function () {
    Config::current()->update(['type_styles' => ['Opinion' => ['bg' => 'bg-x', 'text' => 'text-x']]]);
    $user = approver();

    $this->actingAs($user)
        ->get('/admin/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('name', config('app.name'))
            ->has('quote.message')
            ->has('quote.author')
            ->where('auth.user.id', $user->id)
            ->where('sidebarOpen', true)
            ->where('flash.success', null)
            ->where('flash.error', null)
            ->where('typeStyles', ['Opinion' => ['bg' => 'bg-x', 'text' => 'text-x']])
        );
});

test('flash messages are shared with the next page', function () {
    $this->withSession(['success' => 'Saved!', 'error' => 'Oops'])
        ->get('/')
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.success', 'Saved!')
            ->where('flash.error', 'Oops')
        );
});

test('the sidebar state is read from its cookie', function () {
    $this->withUnencryptedCookie('sidebar_state', 'false')
        ->get('/')
        ->assertInertia(fn (Assert $page) => $page->where('sidebarOpen', false));
});

test('the appearance cookie is shared with the page template', function () {
    $this->withUnencryptedCookie('appearance', 'dark')
        ->get('/')
        ->assertViewHas('appearance', 'dark');
});
