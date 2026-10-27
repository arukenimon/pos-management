import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:8000';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    workers: 1,
    reporter: 'list',
    use: {
        baseURL,
        // Slow down browser actions so the headed demonstration is easy to follow.
        launchOptions: { slowMo: 600 },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
        },
    ],
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command: 'php artisan serve --host=127.0.0.1 --port=8000',
              url: `${baseURL}/login`,
              reuseExistingServer: !process.env.CI,
              timeout: 60_000,
          },
});
