import { expect, test } from '@playwright/test';

test('default import, hooks, validation, dynamic steps and browser history', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByTestId('status')).toHaveText('Step 1 of 3: Welcome');
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeHidden();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('status')).toHaveText('Step 2 of 3: Profile');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('status')).toHaveText('Step 2 of 3: Profile');
    await page.getByRole('textbox').fill('Jason');
    await page.getByRole('checkbox').check();
    await expect(page.getByTestId('status')).toHaveText('Step 2 of 4: Profile');
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(page.getByTestId('status')).toHaveText('Step 4 of 4: Done');
    await expect(page).toHaveURL(/#done$/);
    await page.goBack();
    await expect(page.getByTestId('status')).toHaveText('Step 2 of 4: Profile');
    await page.goForward();
    await expect(page.getByTestId('status')).toHaveText('Step 4 of 4: Done');
    await page.getByRole('checkbox').uncheck();
    await expect(page.getByTestId('status')).toHaveText('Step 3 of 3: Done');
    await expect(page.getByRole('heading', { name: 'Welcome', exact: true })).toBeHidden();
    expect(errors).toEqual([]);
});

test('long inactive steps do not create overflow; inactive controls cannot receive focus', async ({ page }) => {
    await page.goto('/');
    await page.locator('.rsw-step').nth(1).evaluate(element => { (element as HTMLElement).style.minHeight = '3000px'; });
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(1000);
    const input = page.locator('input:not([type=checkbox])');
    await expect(input).toHaveCount(1);
    await expect(input).toBeHidden();
    await page.keyboard.press('Tab');
    expect(await input.evaluate(element => element === document.activeElement)).toBe(false);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(input).toBeVisible();
    await input.fill('Jason');
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(page.getByTestId('status')).toHaveText('Step 3 of 3: Done');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(1000);
});

test('navigation without optional CSS hides outgoing content immediately', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status')).toHaveText('Step 1 of 3: Welcome');
    await page.evaluate(() => document.querySelectorAll('link[rel=stylesheet],style').forEach(element => element.remove()));
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('status')).toHaveText('Step 2 of 3: Profile');
    await expect(page.locator('.rsw-step[hidden]')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Welcome', exact: true, includeHidden: true })).toBeHidden();
});
