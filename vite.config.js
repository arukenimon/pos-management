import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx', 'resources/js/marketing.ts', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: true,        // expose to LAN
        port: 5173,
        strictPort: true,
    },
})
