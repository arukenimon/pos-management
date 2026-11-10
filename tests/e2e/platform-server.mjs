import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// This server always owns its disposable database; it never migrates the .env database.
const directory = mkdtempSync(join(tmpdir(), 'tindahub-platform-e2e-'));
const database = join(directory, 'test.sqlite');
writeFileSync(database, '');
const env = {
    ...process.env,
    APP_ENV: 'testing',
    APP_DEBUG: 'true',
    APP_KEY: `base64:${Buffer.alloc(32, 1).toString('base64')}`,
    APP_URL: 'http://127.0.0.1:8127',
    APP_CONFIG_CACHE: join(directory, 'config.php'),
    APP_ROUTES_CACHE: join(directory, 'routes.php'),
    DB_CONNECTION: 'sqlite',
    DB_DATABASE: database,
    DB_URL: '',
    SESSION_DRIVER: 'database',
    SESSION_COOKIE: 'tindahub_platform_e2e',
    SESSION_DOMAIN: '',
    SESSION_SECURE_COOKIE: 'false',
    CACHE_STORE: 'array',
    QUEUE_CONNECTION: 'sync',
    MAIL_MAILER: 'array',
    BROADCAST_CONNECTION: 'null',
    PLATFORM_E2E_DIR: directory,
};

let server;
let cleaned = false;
function cleanup() {
    if (cleaned) return;
    cleaned = true;
    server?.kill();
    // The exact directory returned by mkdtempSync is the only removal target.
    rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
process.on('exit', cleanup);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(0));

for (const args of [['artisan', 'migrate', '--force', '--no-interaction'], ['tests/e2e/platform-fixtures.php']]) {
    const result = spawnSync('php', args, { env, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
server = spawn('php', ['-S', '127.0.0.1:8127', '-t', 'public', 'tests/e2e/platform-router.php'], { env, stdio: 'inherit' });
server.on('exit', code => process.exit(code ?? 0));
