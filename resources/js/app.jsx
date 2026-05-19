// FILE LOCATION: egov-logs/resources/js/app.jsx
// This is the main entry point — Inertia boots React from here
// This file already exists after Breeze install — REPLACE its contents with this

import './bootstrap';          // Loads Axios + Echo (broadcasting)
import '../css/app.css';       // Loads Tailwind CSS

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'react-hot-toast'; // Global toast container

// App name shown in browser tab
const appName = import.meta.env.VITE_APP_NAME || 'EGov Logs';

createInertiaApp({
    // Sets browser tab title as "Page Name - App Name"
    title: (title) => `${title} - ${appName}`,

    // Automatically finds the right React component for each Inertia page
    // e.g. Inertia::render('Dashboard') → loads resources/js/Pages/Dashboard.jsx
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),

    // Mounts React into the <div id="app"> in your Blade template
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                {/* Toast notification container — renders on every page */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '8px',
                            fontSize: '14px',
                        },
                    }}
                />
            </>
        );
    },

    // Shows a progress bar at top of page during navigation
    progress: {
        color: '#7c3aed', // Purple — matches your severity "critical" color
    },
});