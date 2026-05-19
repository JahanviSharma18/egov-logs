<?php
// FILE LOCATION: app/Http/Controllers/LogIngestionController.php

namespace App\Http\Controllers;

use App\Jobs\ProcessLogEntry;
use App\Models\LogEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class LogIngestionController extends Controller
{
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

        $logEntry = LogEntry::create([
            'level'      => 'info',
            'message'    => $request->message,
            'source'     => $request->source,
            'ip_address' => $request->ip_address ?? $request->ip(),
            'url'        => $request->url_path ?? $request->url,
            'method'     => $request->method_type ?? $request->method,
            'metadata'   => $request->metadata,
            'user_id'    => $request->user_id,
        ]);

        // FIX 11: Bust stat caches when new log arrives so dashboard stays fresh
        Cache::forget('dashboard_stats');
        Cache::forget('dashboard_recent_logs');
        Cache::forget('log_level_counts');
        Cache::forget('log_sources');

        ProcessLogEntry::dispatch($logEntry);

        return response()->json([
            'success' => true,
            'message' => 'Log entry queued for processing',
            'id'      => $logEntry->id,
        ], 201);
    }
}
