<?php
// FILE LOCATION: app/Events/LogIngested.php

namespace App\Events;

use App\Models\LogEntry;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast immediately (ShouldBroadcastNow skips the queue).
 * Fires after ProcessLogEntry classifies a log — pushes it to the
 * "logs" public channel so the dashboard can update in real-time.
 */
class LogIngested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $log;

    public function __construct(LogEntry $logEntry)
    {
        // Only send what the frontend needs — keep the payload small
        $this->log = [
            'id'      => $logEntry->id,
            'level'   => $logEntry->level,
            'source'  => $logEntry->source ?? 'System',
            'message' => $logEntry->message,
            'time'    => $logEntry->created_at->diffForHumans(),
        ];
    }

    /**
     * Broadcast on the public "logs" channel.
     * No auth needed — dashboard is already behind auth middleware.
     */
    public function broadcastOn(): array
    {
        return [new Channel('logs')];
    }

    /**
     * Event name on the frontend: Echo.channel('logs').listen('.LogIngested', ...)
     * The leading dot means we use the full class name as the event name.
     */
    public function broadcastAs(): string
    {
        return 'LogIngested';
    }
}
