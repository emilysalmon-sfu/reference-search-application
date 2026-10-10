<?php

use App\Models\Feedback;
use Inertia\Testing\AssertableInertia as Assert;

function feedbackPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Visitor',
        'email' => 'visitor@example.com',
        'comment' => 'The DOI link on one article is broken.',
    ], $overrides);
}

function makeFeedback(array $attributes = []): Feedback
{
    return Feedback::create(array_merge(feedbackPayload(), $attributes));
}

// Public submission

test('visitors can send feedback', function () {
    $this->post('/report-feedback', feedbackPayload())
        ->assertRedirect()
        ->assertSessionHas('success', 'Thank you for your feedback! We will review it shortly.');

    expect(Feedback::sole())
        ->email->toBe('visitor@example.com')
        ->isResolved->toBeFalse();
});

test('feedback is validated', function (array $payload, string $field) {
    $this->post('/report-feedback', $payload)->assertSessionHasErrors($field);

    expect(Feedback::count())->toBe(0);
})->with([
    'missing name' => [feedbackPayload(['name' => '']), 'name'],
    'bad email' => [feedbackPayload(['email' => 'not-an-email']), 'email'],
    'comment too short' => [feedbackPayload(['comment' => 'Too short']), 'comment'],
    'comment too long' => [feedbackPayload(['comment' => str_repeat('a', 5001)]), 'comment'],
]);

test('bots filling the honeypot are silently ignored', function () {
    $this->post('/report-feedback', feedbackPayload(['website' => 'http://spam.example']))
        ->assertSessionHas('success', 'Thank you for your feedback!');

    expect(Feedback::count())->toBe(0);
});

test('the same feedback cannot be sent twice within an hour', function () {
    $this->post('/report-feedback', feedbackPayload());

    $this->post('/report-feedback', feedbackPayload())
        ->assertSessionHasErrors(['comment' => 'You have already submitted this feedback recently.']);

    $this->travel(61)->minutes();
    $this->post('/report-feedback', feedbackPayload())->assertSessionHasNoErrors();

    expect(Feedback::count())->toBe(2);
});

test('each visitor can send at most 3 feedbacks per 10 minutes', function () {
    $this->freezeTime();

    foreach (range(1, 3) as $i) {
        $this->post('/report-feedback', feedbackPayload(['comment' => "Feedback number {$i} here."]))
            ->assertSessionHasNoErrors();
    }

    $this->post('/report-feedback', feedbackPayload(['comment' => 'Feedback number 4 here.']))
        ->assertSessionHasErrors(['comment' => 'Too many submissions. Please try again in 600 seconds.']);

    expect(Feedback::count())->toBe(3);
});

// Admin management

test('guests cannot manage feedback', function () {
    $feedback = makeFeedback();

    $this->get('/admin/feedbacks')->assertRedirect(route('login'));
    $this->patch("/admin/feedbacks/{$feedback->id}/resolve")->assertRedirect(route('login'));
    $this->delete("/admin/feedbacks/{$feedback->id}")->assertRedirect(route('login'));
});

test('the feedback list shows newest first and can be paged', function () {
    makeFeedback(['comment' => 'Older feedback here.']);
    $this->travel(1)->minutes();
    makeFeedback(['comment' => 'Newer feedback here.']);

    $this->actingAs(approver())
        ->get('/admin/feedbacks?per_page=1')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Feedback/feedbackList')
            ->has('feedbacks.data', 1)
            ->where('feedbacks.data.0.comment', 'Newer feedback here.')
            ->where('feedbacks.total', 2)
        );
});

test('feedback can be searched by name, email or comment', function (string $search) {
    makeFeedback(['name' => 'Ana Lima', 'email' => 'ana@lima.dev', 'comment' => 'Search is slow today.']);
    makeFeedback(['name' => 'Bob', 'email' => 'bob@example.com', 'comment' => 'Love the site.']);

    $this->actingAs(approver())
        ->get('/admin/feedbacks/search?search='.urlencode($search))
        ->assertInertia(fn (Assert $page) => $page
            ->has('feedbacks.data', 1)
            ->where('feedbacks.data.0.name', 'Ana Lima')
        );
})->with(['name' => 'Lima', 'email' => 'ana@', 'comment' => 'slow']);

test('feedback can be filtered by status', function (string $status, int $expected) {
    makeFeedback(['comment' => 'Open feedback here.']);
    makeFeedback(['comment' => 'Closed feedback here.', 'isResolved' => true]);

    $this->actingAs(approver())
        ->get("/admin/feedbacks/search?status={$status}")
        ->assertInertia(fn (Assert $page) => $page->has('feedbacks.data', $expected));
})->with([
    'resolved' => ['resolved', 1],
    'unresolved' => ['unresolved', 1],
    'all' => ['all', 2],
]);

test('feedback can be resolved, reopened and deleted', function () {
    $feedback = makeFeedback();
    $this->actingAs(approver());

    $this->patch("/admin/feedbacks/{$feedback->id}/resolve")
        ->assertSessionHas('success', 'Feedback marked as resolved.');
    expect($feedback->fresh()->isResolved)->toBeTrue();

    $this->patch("/admin/feedbacks/{$feedback->id}/unresolve")
        ->assertSessionHas('success', 'Feedback marked as unresolved.');
    expect($feedback->fresh()->isResolved)->toBeFalse();

    $this->delete("/admin/feedbacks/{$feedback->id}")
        ->assertSessionHas('success', 'Feedback deleted successfully.');
    expect(Feedback::count())->toBe(0);
});
