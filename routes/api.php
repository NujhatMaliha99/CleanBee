<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AreaReportController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\PickupRequestController;
use App\Http\Controllers\PickupPhotoController;
use App\Http\Controllers\VolunteerTaskController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Area Reports
    Route::get('/area-reports', [AreaReportController::class, 'index']);

    Route::post('/area-reports', [AreaReportController::class, 'store']);

    Route::get('/area-reports/{report}', [AreaReportController::class, 'show']);

    Route::put('/area-reports/{report}', [AreaReportController::class, 'update']);

    // Volunteer and Admin
    Route::middleware(RoleMiddleware::class . ':volunteer,admin')->group(function () {

        Route::get('/volunteer/tasks', function () {
            return response()->json([
                'message' => 'Volunteer dashboard tasks'
            ]);
        });

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

        Route::get('/admin/reports', function () {
            return response()->json([
                'message' => 'Admin system reports'
            ]);
        });
    });
});