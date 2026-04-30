<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    /**
     * Display a listing of feedbacks.
     */
    public function index(Request $request)
    {
        $feedbacks = Feedback::query()
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return Inertia::render('Feedback/feedbackList', [
            'feedbacks' => $feedbacks,
        ]);
    }

    /**
     * Search feedbacks.
     */
    public function search(Request $request)
    {
        $query = Feedback::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('comment', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'resolved') {
                $query->where('isResolved', true);
            } elseif ($status === 'unresolved') {
                $query->where('isResolved', false);
            }
        }

        $feedbacks = $query
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return Inertia::render('Feedback/feedbackList', [
            'feedbacks' => $feedbacks,
        ]);
    }

    /**
     * Store a newly created feedback.
     */
    public function store(Request $request)
    {
        // Rate limiting: max 3 submissions per 10 minutes per IP
        $key = 'feedback-submission:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'comment' => "Too many submissions. Please try again in {$seconds} seconds.",
            ]);
        }

        // Honeypot check - if this hidden field is filled, it's likely a bot
        if ($request->filled('website')) {
            // Silently reject but return success to not alert the bot
            return back()->with('success', 'Thank you for your feedback!');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'comment' => 'required|string|min:10|max:5000',
        ]);

        // Check for duplicate submission (same email + similar comment within last hour)
        $recentDuplicate = Feedback::where('email', $validated['email'])
            ->where('created_at', '>=', now()->subHour())
            ->where('comment', $validated['comment'])
            ->exists();

        if ($recentDuplicate) {
            return back()->withErrors([
                'comment' => 'You have already submitted this feedback recently.',
            ]);
        }

        Feedback::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'comment' => $validated['comment'],
            'isResolved' => false,
        ]);

        // Increment rate limiter
        RateLimiter::hit($key, 600); // 10 minutes decay

        return back()->with('success', 'Thank you for your feedback! We will review it shortly.');
    }

    /**
     * Mark feedback as resolved.
     */
    public function resolve(Feedback $feedback)
    {
        $feedback->update(['isResolved' => true]);

        return back()->with('success', 'Feedback marked as resolved.');
    }

    /**
     * Mark feedback as unresolved.
     */
    public function unresolve(Feedback $feedback)
    {
        $feedback->update(['isResolved' => false]);

        return back()->with('success', 'Feedback marked as unresolved.');
    }

    /**
     * Remove the specified feedback.
     */
    public function destroy(Feedback $feedback)
    {
        $feedback->delete();

        return back()->with('success', 'Feedback deleted successfully.');
    }

    /**
     * Get unresolved feedback count for dashboard.
     */
    public static function getUnresolvedCount(): int
    {
        return Feedback::where('isResolved', false)->count();
    }
}
