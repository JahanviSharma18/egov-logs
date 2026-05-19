// FILE LOCATION: egov-logs/vite.config.js
// This file already exists after Breeze install — REPLACE its contents with this

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // Entry points — Vite bundles these files
            input: 'resources/js/app.jsx',
            refresh: true, // Hot reload on Blade/PHP file changes
        }),
        react(), // Enables JSX compilation
    ],
    resolve: {
        alias: {
            // Allows importing like: import X from '@/Components/X'
            // instead of: import X from '../../Components/X'
            '@': '/resources/js',
        },
    },
});