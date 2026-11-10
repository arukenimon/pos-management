import { expect, Page, test } from '@playwright/test';

async function login(page: Page, email = 'platform@example.test') {
    await page.goto('/login');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('PlatformTest123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

test('operator manages access through directories, confirmation dialogs, and the audit log', async ({ page, browser }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await login(page);
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toBeVisible();
    await expect(page.locator('.dashboard-card').last()).toHaveCSS('opacity', '1');
    await page.screenshot({ path: testInfo.outputPath('platform-desktop-dark.png'), fullPage: true });
    await page.goto('/super-admin/shops');
    await page.getByLabel('Search', { exact: true }).fill('Platform review');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page.getByText('1–25 of 28')).toBeVisible();
    await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Next', exact: true }).click();
    await expect(page.getByText('26–28 of 28')).toBeVisible();
    expect(new URL(page.url()).searchParams.get('q')).toBe('Platform review');
    expect(new URL(page.url()).searchParams.get('page')).toBe('2');
    await expect(page.getByLabel('Search', { exact: true })).toHaveValue('Platform review');

    await page.goto('/super-admin/shops?q=Market');
    await page.getByRole('link', { name: 'Market Lane', exact: true }).click();
    await page.getByRole('button', { name: 'Suspend shop', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Internal reason').fill('Browser verification: shop review');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Suspend shop', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Suspended', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Browser verification: shop review', { exact: true })).toBeVisible();

    await page.goto('/super-admin/users?q=shop-owner');
    await page.getByRole('link', { name: 'Shop Owner', exact: true }).click();
    await page.getByRole('button', { name: 'Suspend account', exact: true }).click();
    await dialog.getByLabel('Internal reason').fill('Browser verification: account review');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Suspend account', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore account' })).toBeVisible();

    const memberContext = await browser.newContext();
    const member = await memberContext.newPage();
    await login(member, 'shop-owner@example.test');
    await expect(member.getByText('These credentials do not match our records.')).toBeVisible();

    await page.getByRole('button', { name: 'Restore account' }).click();
    await dialog.getByLabel('Internal reason').fill('Browser verification: account cleared');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Restore account', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await login(member, 'shop-owner@example.test');
    await expect(member.getByRole('heading', { name: 'Select a shop' })).toBeVisible();
    await member.goto('/market-lane');
    await expect(member.getByRole('heading', { name: 'Shop suspended' })).toBeVisible();
    await expect(member.getByText('Browser verification: shop review')).toHaveCount(0);
    await member.goto('/river-shop');
    await expect(member.getByRole('heading', { name: 'Welcome back, Shop' })).toBeVisible();
    await memberContext.close();

    await page.goto('/super-admin/shops?q=Market');
    await page.getByRole('link', { name: 'Market Lane', exact: true }).click();
    await page.getByRole('button', { name: 'Restore shop' }).click();
    await dialog.getByLabel('Internal reason').fill('Browser verification: shop cleared');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Restore shop', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Suspend shop' })).toBeVisible();
    await page.goto('/super-admin/audit-log?target=Market&action=shop.restored');
    await expect(page.getByText('Browser verification: shop cleared', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test('platform pages support light and dark themes, narrow screens, and keyboard navigation', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await login(page);
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.screenshot({ path: testInfo.outputPath('platform-desktop-light.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    for (const theme of ['light', 'dark']) {
        if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark mode' }).click();
        for (const path of ['/super-admin', '/super-admin/shops', '/super-admin/users', '/super-admin/audit-log', '/profile']) {
            await page.goto(path);
            await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        await page.goto('/super-admin');
        await page.screenshot({ path: testInfo.outputPath(`platform-mobile-${theme}.png`), fullPage: true });
    }
    const opener = page.getByRole('button', { name: 'Open navigation', exact: true });
    await opener.click();
    await expect(page.getByRole('dialog', { name: 'Navigation' }).getByRole('button', { name: 'Close navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Navigation' })).not.toBeVisible();
    await expect(opener).toBeFocused();
    await opener.click();
    await page.getByRole('dialog', { name: 'Navigation' }).getByRole('link', { name: 'Shops', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Shops', exact: true })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Navigation' })).not.toBeVisible();
});
