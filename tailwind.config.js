// FILE LOCATION: egov-logs/tailwind.config.js
// REPLACE entire contents

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import flowbite from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './node_modules/flowbite-react/lib/**/*.js',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                // Aurora Intelligence Theme
                brand: {
                    DEFAULT: '#059669', // Emerald 600
                    glow: 'rgba(5, 150, 105, 0.4)',
                },
                aurora: {
                    cyan: '#06b6d4',
                    emerald: '#10b981',
                    teal: '#14b8a6',
                    midnight: '#020617',
                    forest: '#064e3b',
                },
                glass: {
                    DEFAULT: 'rgba(15, 23, 42, 0.6)',
                    border: 'rgba(148, 163, 184, 0.1)',
                }
            },
            animation: {
                'aurora-shift': 'aurora-shift 15s ease infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'scan': 'scan 3s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                'aurora-shift': {
                    '0%, 100%': { transform: 'scale(1) translate(0, 0)' },
                    '33%': { transform: 'scale(1.1) translate(2%, 3%)' },
                    '66%': { transform: 'scale(0.9) translate(-2%, -2%)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' },
                    '50%': { opacity: '.6', boxShadow: '0 0 5px rgba(6, 182, 212, 0.1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(200%)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            }
        },
    },
    plugins: [forms, flowbite],
};