<?php
// FILE LOCATION: app/Notifications/CriticalLogAlert.php

namespace App\Notifications;

use App\Models\LogEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Notification;

class CriticalLogAlert extends Notification implements ShouldQueue
{
    use Queueable;

    // Colour map — used in Slack attachment sidebar + email badge
    private const LEVEL_COLORS = [
        'critical' => '#a855f7', // purple
        'security' => '#ec4899', // pink
        'error'    => '#ef4444', // red
        'warning'  => '#f59e0b', // amber
        'info'     => '#3b82f6', // blue
    ];

    public function __construct(private LogEntry $logEntry)
    {
        //
    }

    /**
     * Delivery channels — add 'slack' when channel === 'slack'
     * The rule's channel is resolved in ProcessLogEntry before dispatching.
     */
    public function via(object $notifiable): array
    {
        // $notifiable is an AnonymousNotifiable; we tag the channel
        // via a custom property set in ProcessLogEntry
        return $notifiable->routeNotificationFor('slack')
            ? ['mail', 'slack']
            : ['mail'];
    }

    // ─── Mail ────────────────────────────────────────────────────

    public function toMail(object $notifiable): MailMessage
    {
        $log   = $this->logEntry;
        $level = strtoupper($log->level);
        $color = self::LEVEL_COLORS[$log->level] ?? '#f97316';

        return (new MailMessage)
            ->subject("🚨 [{$level}] GovTrace Alert — {$log->source}")
            ->view('emails.critical-log-alert', [
                'log'   => $log,
                'level' => $level,
                'color' => $color,
            ]);
    }

    // ─── Slack ───────────────────────────────────────────────────

    public function toSlack(object $notifiable): SlackMessage
    {
        $log   = $this->logEntry;
        $color = self::LEVEL_COLORS[$log->level] ?? '#f97316';
        $level = strtoupper($log->level);
        $time  = $log->created_at->format('d M Y, H:i:s');

        return (new SlackMessage)
            ->from('GovTrace', ':radar:')
            ->error()  // marks message as red in Slack; overridden visually by attachment
            ->content("🚨 *[{$level}] Alert from {$log->source}*")
            ->attachment(function ($attachment) use ($log, $color, $level, $time) {
                $attachment
                    ->title("Log #{$log->id} — {$log->source}")
                    ->color($color)
                    ->fields([
                        'Level'      => $level,
                        'Source'     => $log->source ?? '—',
                        'IP Address' => $log->ip_address ?? '—',
                        'Time'       => $time,
                    ])
                    ->content($log->message)
                    ->footer('GovTrace · AICTE E-Gov Monitoring')
                    ->timestamp($log->created_at);
            });
    }

    public function toArray(object $notifiable): array
    {
        return [
            'log_entry_id' => $this->logEntry->id,
            'level'        => $this->logEntry->level,
            'source'       => $this->logEntry->source,
            'message'      => $this->logEntry->message,
        ];
    }
}
