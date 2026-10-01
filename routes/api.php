<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AreaReportController;
use App\Http\Controllers\LandingController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\PickupRequestController;
use App\Http\Controllers\PickupPhotoController;
use App\Http\Controllers\VolunteerTaskController;
use App\Http\Controllers\VolunteerProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RewardRedemptionController;
use App\Http\Controllers\AdminReviewController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/landing', [LandingController::class, 'index']);

Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/landing/wallet', [LandingController::class, 'wallet']);
    Route::get('/dashboard', [DashboardController::class, 'show']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::get('/rewards', [RewardRedemptionController::class, 'index']);
    Route::get('/reward-redemptions', [RewardRedemptionController::class, 'history']);
    Route::post('/rewards/{reward}/redeem', [RewardRedemptionController::class, 'redeem']);
    Route::put('/volunteer/mode', [VolunteerProfileController::class, 'updateMode']);
    Route::put('/volunteer/availability', [VolunteerProfileController::class, 'updateAvailability']);

    Route::get('/pickups', [PickupRequestController::class, 'index']);
    Route::post('/pickups', [PickupRequestController::class, 'store']);
    Route::get('/pickups/{pickup}', [PickupRequestController::class, 'show']);
    Route::put('/pickups/{pickup}', [PickupRequestController::class, 'update']);
    Route::delete('/pickups/{pickup}', [PickupRequestController::class, 'destroy']);
    Route::get('/pickups/{pickup}/photos', [PickupPhotoController::class, 'index']);
    Route::post('/pickups/{pickup}/photos', [PickupPhotoController::class, 'store']);

    // Area Reports
    Route::get('/area-reports', [AreaReportController::class, 'index']);

    Route::post('/area-reports', [AreaReportController::class, 'store']);

    Route::get('/area-reports/{report}', [AreaReportController::class, 'show']);

    Route::put('/area-reports/{report}', [AreaReportController::class, 'update']);

    // Volunteer and Admin
    Route::middleware(RoleMiddleware::class . ':volunteer,admin')->group(function () {

        Route::get('/volunteer/tasks', [VolunteerTaskController::class, 'index']);
        Route::get('/volunteer/my-tasks', [VolunteerTaskController::class, 'myTasks']);
        Route::get('/volunteer/tasks/{pickup}', [VolunteerTaskController::class, 'show']);
        Route::post('/volunteer/tasks/{pickup}/claim', [VolunteerTaskController::class, 'claim']);
        Route::post('/volunteer/tasks/{pickup}/start', [VolunteerTaskController::class, 'start']);
        Route::post('/volunteer/tasks/{pickup}/complete', [VolunteerTaskController::class, 'complete']);

        Route::post('/area-reports/{report}/assign', [
            AreaReportController::class,
            'assign'
        ]);

        Route::post('/area-reports/{report}/resolve', [
            AreaReportController::class,
            'resolve'
        ]);
    });

    // Admin
    Route::middleware(RoleMiddleware::class . ':admin')->group(function () {

        Route::get('/admin/reviews', [AdminReviewController::class, 'index']);
        Route::post('/admin/reviews/{type}/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::post('/admin/reviews/{type}/{id}/reject', [AdminReviewController::class, 'reject']);

        Route::get('/admin/reports', function () {
            return response()->json([
                'message' => 'Admin system reports'
            ]);
        });
    });
});
