<?php
// FILE LOCATION: database/migrations/2026_05_20_000001_add_performance_indexes_to_log_entries.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('log_entries', function (Blueprint $table) {
            // FIX 9: Composite index for the most common query pattern:
            // filtering by level + ordering by created_at
            $table->index(['level', 'created_at'], 'idx_level_created');

            // Index for source filter dropdown (used on every Logs page load)
            // source is already indexed, but add created_at composite for sort
            $table->index(['source', 'created_at'], 'idx_source_created');

            // Index for date range filter queries
            $table->index('created_at', 'idx_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('log_entries', function (Blueprint $table) {
            $table->dropIndex('idx_level_created');
            $table->dropIndex('idx_source_created');
            $table->dropIndex('idx_created_at');
        });
    }
};
