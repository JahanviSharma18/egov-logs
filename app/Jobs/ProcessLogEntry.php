<?php
// FILE LOCATION: app/Jobs/ProcessLogEntry.php

namespace App\Jobs;

use App\Events\LogIngested;
use App\Models\LogEntry;
use App\Models\NotificationRule;
use App\Notifications\CriticalLogAlert;
use App\Services\LogClassifierService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ProcessLogEntry implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Retry up to 3 times on failure
    public int $tries = 3;

    public function __construct(private LogEntry $logEntry)
    {
        //
    }

    public function handle(LogClassifierService $classifier): void
    {
        try {
            // 1. Classify the log message
            $meta = $classifier->classifyWithMeta($this->logEntry->message);

            // 2. Update the log entry with classification result
            $this->logEntry->update([
                'level'         => $meta['level'],
                'classified_at' => $meta['classified_at'],
            ]);

            // 3. Broadcast to dashboard in real-time via Reverb WebSocket
            broadcast(new LogIngested($this->logEntry));

            // 4. Fire notifications if the classifier flagged it
            if ($meta['should_notify']) {
                $this->handleNotifications($meta['level']);
            }

        } catch (\Throwable $e) {
            Log::error('ProcessLogEntry failed: ' . $e->getMessage(), [
                'log_entry_id' => $this->logEntry->id,
            ]);
            throw $e;
        }
    }

    private function handleNotifications(string $level): void
    {
        // Find all active rules whose trigger_level matches the classified level
        $rules = NotificationRule::active()
            ->where('trigger_level', $level)
            ->get();

        foreach ($rules as $rule) {

            // ── Cooldown check ──────────────────────────────────
            // Key: e.g. "notif_rule_3_critical" — expires after cooldown_minutes
            $cacheKey = "notif_rule_{$rule->id}_{$level}";

            if (Cache::has($cacheKey)) {
                Log::debug("Notification skipped (cooldown): Rule [{$rule->name}]", [
                    'log_entry_id' => $this->logEntry->id,
                ]);
                continue;
            }

            // Lock this rule for the cooldown window
            Cache::put($cacheKey, true, now()->addMinutes($rule->cooldown_minutes));

            // Mark log as notified
            $this->logEntry->update(['notified' => true]);

            // ── Route to the correct channel ────────────────────
            try {
                if ($rule->channel === 'slack') {
                    // Slack — route by webhook URL stored in recipient field
                    Notification::route('slack', $rule->recipient)
                        ->notify(new CriticalLogAlert($this->logEntry));

                } else {
                    // Mail (default) — route by email address
                    Notification::route('mail', $rule->recipient)
                        ->notify(new CriticalLogAlert($this->logEntry));
                }

                Log::info("Notification dispatched: Rule [{$rule->name}] via [{$rule->channel}]", [
                    'log_entry_id' => $this->logEntry->id,
                    'recipient'    => $rule->recipient,
                ]);

            } catch (\Throwable $e) {
                Log::error("Notification failed: Rule [{$rule->name}] — " . $e->getMessage(), [
                    'log_entry_id' => $this->logEntry->id,
                ]);
            }
        }
    }
}