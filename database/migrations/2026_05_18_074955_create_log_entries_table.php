<?php
// FILE: database/migrations/xxxx_create_log_entries_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_entries', function (Blueprint $table) {
            $table->id();

            // Severity level — set by the auto-classifier
            $table->enum('level', [
                'debug', 'info', 'warning',
                'error', 'critical', 'security', 'audit'
            ])->default('info')->index();

            // The actual log message
            $table->text('message');

            // Where the log came from (e.g. "AuthService", "PaymentModule")
            $table->string('source')->nullable()->index();

            // IP address of the request that caused the log
            $table->string('ip_address', 45)->nullable();

            // Which user triggered this (null = system/anonymous)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete();

            // Extra data — stack traces, request payload, headers etc.
            $table->json('metadata')->nullable();

            // HTTP method + URL (e.g. "POST /api/login")
            $table->string('url')->nullable();
            $table->string('method', 10)->nullable();

            // When the classifier processed this log
            $table->timestamp('classified_at')->nullable();

            // Whether a notification was sent for this log
            $table->boolean('notified')->default(false);

            // Soft delete — logs are never hard deleted (compliance)
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_entries');
    }
};