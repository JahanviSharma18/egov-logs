<?php
// FILE: app/Models/NotificationRule.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationRule extends Model
{
    protected $fillable = [
        'name', 'trigger_level', 'channel',
        'recipient', 'is_active', 'cooldown_minutes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Only return active rules
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}