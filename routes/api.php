<?php

use App\Http\Controllers\AuthController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\PickupRequestController;
use App\Http\Controllers\VolunteerTaskController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{user}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:6,1');

    Route::middleware('verified')->group(function () {
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::apiResource('pickups', PickupRequestController::class);

        Route::middleware(RoleMiddleware::class . ':volunteer,admin')->group(function () {
            Route::get('/volunteer/tasks', [VolunteerTaskController::class, 'index']);
            Route::get('/volunteer/tasks/{pickup}', [VolunteerTaskController::class, 'show']);
            Route::get('/volunteer/my-tasks', [VolunteerTaskController::class, 'myTasks']);
            Route::post('/volunteer/tasks/{pickup}/claim', [VolunteerTaskController::class, 'claim']);
            Route::post('/volunteer/tasks/{pickup}/start', [VolunteerTaskController::class, 'start']);
            Route::post('/volunteer/tasks/{pickup}/complete', [VolunteerTaskController::class, 'complete']);
        });

        Route::middleware(RoleMiddleware::class . ':admin')->group(function () {
            Route::get('/admin/reports', function () {
                return response()->json(['message' => 'Admin system reports']);
            });
        });
    });
});
