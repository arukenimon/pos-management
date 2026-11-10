import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'APP_URL')
    const appHost = new URL(env.APP_URL || 'http://localhost').hostname

    return {
        plugins: [
            laravel({
                input: ['resources/js/app.tsx', 'resources/js/marketing.ts', 'resources/css/app.css', 'resources/css/marketing.css'],
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: true,        // expose to LAN
            port: 5173,
            strictPort: true,
            // Advertise the browser-reachable app host instead of the wildcard listen address.
            hmr: { host: appHost },
        },
    }
})
