import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: 'super-admin.spec.ts',
    timeout: 90_000,
    expect: { timeout: 10_000 },
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:8127',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [{ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }],
    webServer: {
        command: 'node tests/e2e/platform-server.mjs',
        url: 'http://127.0.0.1:8127/login',
        reuseExistingServer: false,
        stdout: 'ignore',
        stderr: 'ignore',
        timeout: 60_000,
    },
});
