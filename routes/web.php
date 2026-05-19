<?php
// FILE LOCATION: routes/web.php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationRuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ── Root → redirect to login ─────────────────────────────────
Route::get('/', fn() => redirect()->route('login'));

// ── Auth routes (Breeze — login, register, etc.) ─────────────
require __DIR__ . '/auth.php';

// ── Authenticated routes ──────────────────────────────────────
Route::middleware('auth')->group(function () {

    // ── Group: Everyone (Viewer, Analyst, Admin, Super-Admin) ──
    // Dashboard and Logs (Read-only)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/logs',      [LogController::class, 'index'])      ->name('logs.index');
    
    // Profile (Breeze default)
    Route::get   ('/profile', [ProfileController::class, 'edit'])   ->name('profile.edit');
    Route::patch ('/profile', [ProfileController::class, 'update']) ->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    // ── Group: Analyst, Admin ──
    Route::middleware('role:admin|analyst')->group(function () {
        // Log Exports
        Route::get('/logs/export-csv', [LogController::class, 'exportCsv'])->name('logs.export-csv');

        // Reports
        Route::get   ('/reports',        [\App\Http\Controllers\ReportController::class, 'index']) ->name('reports.index');
        Route::post  ('/reports/export', [\App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');

        // Audit Trail
        Route::get   ('/audit', [\App\Http\Controllers\AuditTrailController::class, 'index'])->name('audit.index');
    });


    // ── Group: Admin ──
    Route::middleware('role:admin')->group(function () {
        
        // Log Deletion (Added for Super Admin requirement)
        Route::delete('/logs/{log}', [LogController::class, 'destroy'])->name('logs.destroy');

        // Notification Rules (Alerts page)
        Route::get   ('/alerts',               [NotificationRuleController::class, 'index'])  ->name('alerts.index');
        Route::post  ('/alerts',               [NotificationRuleController::class, 'store'])  ->name('alerts.store');
        Route::patch ('/alerts/{rule}/toggle', [NotificationRuleController::class, 'toggle'])->name('alerts.toggle');
        Route::delete('/alerts/{rule}',        [NotificationRuleController::class, 'destroy'])->name('alerts.destroy');

        // Users & Roles (Assignment)
        Route::get   ('/users',                          [UserController::class, 'index'])      ->name('users.index');
        Route::post  ('/users/{user}/roles',             [UserController::class, 'assignRole']) ->name('users.assign-role');
        Route::delete('/users/{user}/roles/{role}',      [UserController::class, 'removeRole']) ->name('users.remove-role');
        Route::delete('/users/{user}',                   [UserController::class, 'destroy'])    ->name('users.destroy');
        Route::post  ('/users/seed-roles',               [UserController::class, 'seedRoles'])  ->name('users.seed-roles');

        // Custom Roles Management
        Route::get   ('/roles',          [\App\Http\Controllers\RoleController::class, 'index'])  ->name('roles.index');
        Route::post  ('/roles',          [\App\Http\Controllers\RoleController::class, 'store'])  ->name('roles.store');
        Route::delete('/roles/{role}',   [\App\Http\Controllers\RoleController::class, 'destroy'])->name('roles.destroy');

        // Settings
        Route::get   ('/settings',             [\App\Http\Controllers\SettingsController::class, 'index'])     ->name('settings.index');
        Route::post  ('/settings',             [\App\Http\Controllers\SettingsController::class, 'update'])    ->name('settings.update');
        Route::post  ('/settings/clear-cache', [\App\Http\Controllers\SettingsController::class, 'clearCache'])->name('settings.clear-cache');
    });
});