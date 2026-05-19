<?php
// FILE LOCATION: app/Services/LogClassifierService.php

namespace App\Services;

class LogClassifierService
{
    /**
     * Keyword rules — ordered from most specific to least.
     * First match wins, so put CRITICAL/SECURITY before ERROR before WARNING etc.
     */
    private array $rules = [
        'security' => [
            'sql injection', 'xss', 'csrf', 'brute force',
            'unauthorized access', 'suspicious', 'intrusion',
            'malicious', 'attack', 'exploit', 'payload',
            'failed login', 'invalid token', 'forbidden',
            'blocked ip', 'rate limit exceeded',
        ],
        'critical' => [
            'out of memory', 'oom killer', 'disk full', 'disk space',
            'server down', 'service crashed', 'fatal', 'kernel panic',
            'database unreachable', 'connection refused',
            'certificate expired', 'ssl error', 'data loss',
            'corruption', 'unrecoverable',
        ],
        'error' => [
            'exception', 'error', 'failed', 'failure', 'unhandled',
            'traceback', 'stack trace', 'null pointer', 'undefined',
            'cannot connect', 'timeout', 'not found', '500',
            'internal server', 'bad gateway', 'service unavailable',
        ],
        'warning' => [
            'warning', 'warn', 'deprecated', 'slow query', 'high memory',
            'high cpu', 'retry', 'retrying', 'approaching limit',
            'near capacity', 'latency', 'degraded', 'fallback',
            'memory usage', 'threshold', 'queue backing up',
        ],
        'audit' => [
            'role changed', 'permission granted', 'permission revoked',
            'user deleted', 'user created', 'password changed',
            'settings updated', 'config changed', 'export performed',
            'admin action', 'privilege', 'policy updated',
        ],
        'debug' => [
            'debug', 'trace', 'verbose', 'dump', 'inspect',
            'breakpoint', 'profiling',
        ],
    ];

    /**
     * Classify a log message and return the level.
     * Falls back to 'info' if no keywords match.
     */
    public function classify(string $message): string
    {
        $lower = strtolower($message);

        foreach ($this->rules as $level => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    return $level;
                }
            }
        }

        return 'info'; // default
    }

    /**
     * Classify and return full metadata including whether to notify.
     */
    public function classifyWithMeta(string $message): array
    {
        $level = $this->classify($message);

        return [
            'level'          => $level,
            'classified_at'  => now(),
            // Auto-notify for critical and security logs
            'should_notify'  => in_array($level, ['critical', 'security']),
        ];
    }
}