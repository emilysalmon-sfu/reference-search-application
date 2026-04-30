<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('dashboard', function () {
    return redirect('/admin/dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin', function () {
        return redirect('/admin/dashboard');
    });
    Route::controller(UserController::class)->group(function () {
        Route::post('logout', 'logout')->name('logout');
    });
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::controller(DashboardController::class)->group(function () {
        Route::get('dashboard', 'index')->name('dashboard');
        Route::get('dashboard/stats', 'getFilteredStats')->name('dashboardStats');
    });

    // Documentation page - available to all authenticated users
    Route::get('documentation', function () {
        return Inertia::render('Documentation/index');
    })->name('documentation');

    Route::controller(FileController::class)->group(function () {
        Route::get('upload', 'index')->name('fileUploadIndex');
        Route::post('upload', 'fileUpload')->name('fileUpload');
    });

    Route::controller(ApprovalController::class)->group(function () {
        Route::get('approvals', 'index')->name('approvalsIndex');
        Route::put('approvals/{article}/approve', 'approve')->name('approvalsApprove');
        Route::delete('approvals/{article}/reject', 'reject')->name('approvalsReject');
    });

    // Admin-only routes
    Route::middleware([EnsureUserIsAdmin::class])->group(function () {
        Route::controller(UserController::class)->group(function () {
            Route::get('users', 'index')->name('usersIndex');
            Route::get('users/search', 'search')->name('usersSearch');
            Route::post('users', 'store')->name('usersStore');
            Route::put('users/{user}', 'update')->name('usersUpdate');
            Route::delete('users/{user}', 'destroy')->name('usersDestroy');
            Route::post('users/{user}/reset-password', 'sendPasswordReset')->name('usersSendPasswordReset');
        });

        Route::controller(ConfigController::class)->group(function () {
            Route::get('config', 'show')->name('configIndex');
            Route::put('config/update', 'update')->name('configUpdate');
        });
    });
    Route::controller(ArticleController::class)->group(function () {
        Route::get('articles/new', 'create')->name('articlesCreate');
        Route::get('articles/list', 'list')->name('articlesList');
        Route::get('articles/search', 'searchArticlesList')->name('searchArticlesList');
        Route::put('articles/{article}', 'update')->name('articlesUpdate');
        Route::delete('articles/{article}', 'destroy')->name('articlesDestroy');
        Route::post('articles', 'storeFromAdmin')->name('articlesStoreFromAdmin');
    });
    Route::controller(FeedbackController::class)->group(function () {
        Route::get('feedbacks', 'index')->name('feedbacksIndex');
        Route::get('feedbacks/search', 'search')->name('feedbacksSearch');
        Route::patch('feedbacks/{feedback}/resolve', 'resolve')->name('feedbacksResolve');
        Route::patch('feedbacks/{feedback}/unresolve', 'unresolve')->name('feedbacksUnresolve');
        Route::delete('feedbacks/{feedback}', 'destroy')->name('feedbacksDestroy');
    });
});

Route::controller(ArticleController::class)->group(function () {
    Route::get('/', 'index')->name('articlesIndex');
    Route::get('articles/search', 'queryArticles')->name('queryArticles');
    Route::get('articles/journals/search', 'searchJournalNames')->name('searchJournalNames');
    Route::post('articles', 'submitArticleForApproval')->name('submitForApproval');
});

Route::get('/introduction', function () {
    return Inertia::render('introduction');
})->name('introduction');

Route::controller(FeedbackController::class)->group(function () {
    Route::post('report-feedback', 'store')->name('reportFeedback');
});

Route::controller(FileController::class)->group(function () {
    Route::get('export', 'fileExport')->name('fileExport');
});

require __DIR__ . '/settings.php';
