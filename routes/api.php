<?php

use App\Http\Controllers\AuthController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::middleware(RoleMiddleware::class . ':volunteer,admin')->group(function () {
        Route::get('/volunteer/tasks', function () {
            return response()->json(['message' => 'Volunteer dashboard tasks']);
        });
    });

    Route::middleware(RoleMiddleware::class . ':admin')->group(function () {
        Route::get('/admin/reports', function () {
            return response()->json(['message' => 'Admin system reports']);
        });
    });
});
