<?php
// FILE LOCATION: app/Http/Controllers/LogIngestionController.php

namespace App\Http\Controllers;

use App\Jobs\ProcessLogEntry;
use App\Models\LogEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LogIngestionController extends Controller
{
    /**
     * POST /api/ingest-log
     *
     * Accepts a raw log payload, saves it immediately,
     * then dispatches the ProcessLogEntry job to classify it async.
     *
     * Example payload:
     * {
     *   "message": "Database connection failed",
     *   "source":  "PaymentModule",
     *   "ip_address": "192.168.1.10",
     *   "url": "/api/checkout",
     *   "method": "POST",
     *   "metadata": { "duration_ms": 3000 }
     * }
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message'    => 'required|string|max:5000',
            'source'     => 'nullable|string|max:255',
            'ip_address' => 'nullable|ip',
            'url'        => 'nullable|string|max:500',
            'method'     => 'nullable|string|in:GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
            'metadata'   => 'nullable|array',
            'user_id'    => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Save log immediately with default level 'info'
        // The job will update the level after classification
        $logEntry = LogEntry::create([
            'level'      => 'info', // overwritten by classifier
            'message'    => $request->message,
            'source'     => $request->source,
            'ip_address' => $request->ip_address ?? $request->ip(),
            'url'        => $request->url_path ?? $request->url,
            'method'     => $request->method_type ?? $request->method,
            'metadata'   => $request->metadata,
            'user_id'    => $request->user_id,
        ]);

        // Dispatch to queue for async classification + notification
        ProcessLogEntry::dispatch($logEntry);

        return response()->json([
            'success' => true,
            'message' => 'Log entry queued for processing',
            'id'      => $logEntry->id,
        ], 201);
    }
}