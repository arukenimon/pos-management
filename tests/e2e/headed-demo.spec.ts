import { expect, test } from '@playwright/test';

test('watch the sign-in form and registration navigation', async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await test.step('Open the POS sign-in page', async () => {
        const response = await page.goto('/login');
        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
    });

    await test.step('Type sample credentials without submitting them', async () => {
        await page.getByLabel('Email', { exact: true }).pressSequentially('demo@example.test', { delay: 100 });
        await page.getByLabel('Password', { exact: true }).pressSequentially('DemoOnly123!', { delay: 120 });
        await expect(page.getByLabel('Email', { exact: true })).toHaveValue('demo@example.test');
        await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
    });

    await test.step('Show and hide the sample password', async () => {
        await page.getByRole('button', { name: 'Show password', exact: true }).click();
        await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
        await expect(page.getByLabel('Password', { exact: true })).toHaveValue('DemoOnly123!');
        await page.getByRole('button', { name: 'Hide password', exact: true }).click();
        await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
    });

    await test.step('Toggle Remember me on and off', async () => {
        const remember = page.getByRole('checkbox', { name: 'Remember me' });
        await remember.check();
        await expect(remember).toBeChecked();
        await remember.uncheck();
        await expect(remember).not.toBeChecked();
    });

    await test.step('Follow Create one to the registration page', async () => {
        await page.getByRole('link', { name: 'Create one', exact: true }).click();
        await expect(page).toHaveURL(/\/register$/);
        await expect(page.getByRole('heading', { name: 'Create your account', exact: true })).toBeVisible();
        await expect(page.getByLabel('Shop name', { exact: true })).toBeVisible();
    });

    await test.step('Return to sign in and check for browser errors', async () => {
        await page.goBack();
        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
        expect(pageErrors).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath('headed-demo.png') });
    });

    // This intentional pause is only for watching the demo, not for test synchronization.
    if (testInfo.project.use.headless === false) {
        console.log('Demo complete. Keeping the browser visible for 10 seconds before it closes.');
        await page.waitForTimeout(10_000);
    }
});
