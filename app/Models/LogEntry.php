<?php
// FILE: app/Models/LogEntry.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogEntry extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'level', 'message', 'source', 'ip_address',
        'user_id', 'metadata', 'url', 'method',
        'classified_at', 'notified',
    ];

    protected $casts = [
        'metadata'      => 'array',   // JSON → PHP array automatically
        'classified_at' => 'datetime',
        'notified'      => 'boolean',
    ];

    // ─── Relationships ───────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes (reusable query filters) ────────────

    // LogEntry::ofLevel('critical')->get()
    public function scopeOfLevel($query, string $level)
    {
        return $query->where('level', $level);
    }

    // LogEntry::critical()->get()
    public function scopeCritical($query)
    {
        return $query->whereIn('level', ['critical', 'security']);
    }

    // LogEntry::today()->get()
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // ─── Helper ─────────────────────────────────────

    // Returns the Tailwind badge class for each level
    // Used in React via the level value passed as a prop
    public function getLevelColorAttribute(): string
    {
        return match($this->level) {
            'info'     => 'badge-info',
            'warning'  => 'badge-warning',
            'error'    => 'badge-error',
            'critical' => 'badge-critical',
            'security' => 'badge-security',
            'audit'    => 'badge-audit',
            default    => 'badge-debug',
        };
    }
}