<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserDeleteRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 15);

        $users = User::orderBy('created_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('Users/users', [
            'users' => $users,
        ]);
    }

    /**
     * Search users by name or email.
     */
    public function search(Request $request): Response
    {
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 15);

        $users = User::where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('Users/users', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(UserStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        Log::info('User created', [
            'action' => 'user_created',
            'created_user_id' => $newUser->id,
            'created_user_email' => $newUser->email,
            'created_user_role' => $newUser->role,
            'performed_by_id' => Auth::id(),
            'performed_by_email' => Auth::user()->email,
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user.
     */
    public function update(UserUpdateRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        // Track what changed
        $changes = [];
        if ($user->name !== $validated['name']) {
            $changes['name'] = ['from' => $user->name, 'to' => $validated['name']];
        }
        if ($user->email !== $validated['email']) {
            $changes['email'] = ['from' => $user->email, 'to' => $validated['email']];
        }
        if ($user->role !== $validated['role']) {
            $changes['role'] = ['from' => $user->role, 'to' => $validated['role']];
        }
        if (!empty($validated['password'])) {
            $changes['password'] = 'changed';
        }

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        Log::info('User updated', [
            'action' => 'user_updated',
            'updated_user_id' => $user->id,
            'updated_user_email' => $user->email,
            'changes' => $changes,
            'performed_by_id' => Auth::id(),
            'performed_by_email' => Auth::user()->email,
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(UserDeleteRequest $request, User $user): RedirectResponse
    {
        // Prevent users from deleting themselves
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        Log::info('User deleted', [
            'action' => 'user_deleted',
            'deleted_user_id' => $user->id,
            'deleted_user_email' => $user->email,
            'deleted_user_role' => $user->role,
            'performed_by_id' => Auth::id(),
            'performed_by_email' => Auth::user()->email,
        ]);

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Send a password reset link to the user.
     */
    public function sendPasswordReset(User $user): RedirectResponse
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('Password reset link sent', [
                'action' => 'password_reset_sent',
                'target_user_id' => $user->id,
                'target_user_email' => $user->email,
                'performed_by_id' => Auth::id(),
                'performed_by_email' => Auth::user()->email,
            ]);

            return redirect()->back()->with('success', 'Password reset link sent to ' . $user->email);
        }

        Log::warning('Password reset link failed', [
            'action' => 'password_reset_failed',
            'target_user_id' => $user->id,
            'target_user_email' => $user->email,
            'performed_by_id' => Auth::id(),
            'performed_by_email' => Auth::user()->email,
        ]);

        return redirect()->back()->with('error', 'Failed to send password reset link. Please try again.');
    }

    /**
     * Logout the current user.
     */
    public function logout(): RedirectResponse
    {
        $userId = Auth::id();
        $userEmail = Auth::user()->email;

        Auth::logout();

        Log::info('User logged out', [
            'action' => 'user_logout',
            'user_id' => $userId,
            'user_email' => $userEmail,
        ]);

        return redirect('/');
    }
}
