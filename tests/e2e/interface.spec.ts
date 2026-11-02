import { expect, test } from '@playwright/test';

test('homepage layout is styled while its JavaScript is still loading', async ({ page }) => {
    let releaseScript!: () => void;
    const scriptGate = new Promise<void>(resolve => { releaseScript = resolve; });
    await page.route(/\/(?:resources\/js\/marketing\.ts|build\/assets\/marketing-[^/]+\.js)(?:\?.*)?$/, async route => {
        await scriptGate;
        await route.continue();
    });

    try {
        await page.goto('/', { waitUntil: 'commit' });
        await expect(page.locator('.marketing-nav')).toBeVisible();
        await expect(page.locator('.marketing-nav')).toHaveCSS('display', 'flex');
        await expect(page.locator('.marketing-nav')).toHaveCSS('height', '88px');
        await expect(page.locator('.marketing-nav-actions .marketing-button svg')).toHaveCSS('width', '16px');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('#hero-shader canvas')).toHaveCount(0);
    } finally {
        releaseScript();
    }
});

test('homepage supports product exploration and account entry', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your shop.In a good place.');
    await expect(page.getByRole('link', { name: 'Get started', exact: true }).first()).toHaveAttribute('href', /\/register$/);

    const carousel = page.getByRole('region', { name: 'A day with TindaHub' });
    await carousel.getByRole('button', { name: 'Next slide' }).click();
    await expect(carousel.getByRole('heading', { name: 'Keep the good days moving.' })).toBeVisible();
    await carousel.getByRole('button', { name: 'Previous slide' }).click();
    await expect(carousel.getByRole('heading', { name: 'Open with confidence.' })).toBeVisible();

    await page.getByText('Can my team use it too?', { exact: true }).click();
    await expect(page.getByText('Yes. Owners can invite team members', { exact: false })).toBeVisible();
    expect(errors).toEqual([]);
});

test('theme choice carries from the homepage into the account screens', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('account navigation and password visibility remain usable', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password', { exact: true }).fill('SamplePassword123!');
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
    await page.getByRole('link', { name: 'Create one', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel('Shop name', { exact: true })).toBeVisible();
    await page.goto('/forgot-password');
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
});

test('mobile navigation and layouts fit a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByLabel('Open navigation', { exact: true }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'The product' }).click();
    await expect(page.locator('.marketing-mobile-menu')).not.toHaveAttribute('open', '');
    for (const path of ['/', '/login', '/register', '/forgot-password']) {
        await page.goto(path);
        await expect(page.locator('h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
});

test('reduced motion leaves content visible and disables scrolling effects', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.marquee-track')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.tour-card').first()).toHaveCSS('position', 'static');
    await expect(page.locator('[data-word-reveal] span').first()).toHaveCSS('opacity', '1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
