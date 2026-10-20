<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\KecamatanController;
use App\Http\Controllers\Api\LandAssetController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ActivityLogController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/kecamatan', [KecamatanController::class, 'index']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/recent-assets', [DashboardController::class, 'recentAssets']);
    Route::get('/dashboard/recent-documents', [DashboardController::class, 'recentDocuments']);

    Route::get('/assets', [LandAssetController::class, 'index']);
    Route::post('/assets', [LandAssetController::class, 'store']);
    Route::get('/assets/{asset}', [LandAssetController::class, 'show']);
    Route::put('/assets/{asset}', [LandAssetController::class, 'update']);
    Route::delete('/assets/{asset}', [LandAssetController::class, 'destroy']);

    Route::get('/assets/{asset}/documents', [DocumentController::class, 'byAsset']);
    Route::post('/assets/{asset}/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{document}', [DocumentController::class, 'show']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);

    Route::get('/reports/assets', [ReportController::class, 'assets']);
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
    Route::get('/reports/export/excel', [ReportController::class, 'exportExcel']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('kecamatan', KecamatanController::class)->except('index');
        Route::apiResource('users', UserController::class);
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });
});
