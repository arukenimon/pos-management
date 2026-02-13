import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: true,        // expose to LAN
        port: 5173,
        strictPort: true,
        hmr: {
            host: '192.168.1.2', // 👈 your PC IP },
        }
    },
})
