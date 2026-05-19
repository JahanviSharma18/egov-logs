<?php
// FILE LOCATION: routes/api.php
// REPLACE entire contents with this

use App\Http\Controllers\LogIngestionController;
use Illuminate\Support\Facades\Route;

/*
 * POST /api/ingest-log
 *
 * Used by external services to push logs into GovTrace.
 * No auth required — secured by API key in middleware (add later).
 *
 * Test with curl:
 * curl -X POST http://127.0.0.1:8000/api/ingest-log \
 *   -H "Content-Type: application/json" \
 *   -d '{"message":"Database connection failed","source":"PaymentModule"}'
 */
Route::post('/ingest-log', [LogIngestionController::class, 'store'])
    ->name('logs.ingest');