import { test, expect } from '@playwright/test';

test.describe('Donation Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to donation page
    await page.goto('/donate');
  });

  test('should display donation form', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Make a Donation' })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Wallet Address')).toBeVisible();
    await expect(page.getByLabel('Amount')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Donate Now' })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: 'Donate Now' }).click();

    // Browser validation should prevent submission
    const walletInput = page.getByLabel('Wallet Address');
    await expect(walletInput).toHaveAttribute('required', '');
  });

  test('should submit donation successfully', async ({ page }) => {
    // Fill form
    await page.getByLabel('Wallet Address').fill('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    await page.getByLabel('Amount').fill('1.5');

    // Submit form
    await page.getByRole('button', { name: 'Donate Now' }).click();

    // Wait for loading state
    await expect(page.getByText('Processing Donation...')).toBeVisible();

    // Wait for success message (v0: mock implementation should succeed)
    await expect(page.getByText('Donation processed successfully!')).toBeVisible({ timeout: 10000 });

    // Check donation ID and transaction hash are displayed
    await expect(page.getByText(/Donation ID:/)).toBeVisible();
    await expect(page.getByText(/Transaction:/)).toBeVisible();
  });

  test('should show NFT receipt eligibility for donations ≥ $50', async ({ page }) => {
    // Check helper text mentions NFT receipt
    await expect(page.getByText(/Donations ≥ \$50 USD receive an NFT receipt/)).toBeVisible();
  });

  test('should allow currency selection', async ({ page }) => {
    const currencySelect = page.locator('select');

    // Default is SOL
    await expect(currencySelect).toHaveValue('SOL');

    // Change to USDC
    await currencySelect.selectOption('USDC');
    await expect(currencySelect).toHaveValue('USDC');
  });

  test('should disable form during submission', async ({ page }) => {
    // Fill form
    await page.getByLabel('Wallet Address').fill('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    await page.getByLabel('Amount').fill('1.0');

    // Submit
    await page.getByRole('button', { name: 'Donate Now' }).click();

    // Check fields are disabled during loading
    await expect(page.getByLabel('Wallet Address')).toBeDisabled();
    await expect(page.getByLabel('Amount')).toBeDisabled();
    await expect(page.getByRole('button', { name: /Processing/ })).toBeDisabled();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/blockchain/donate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Test error message',
          },
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel('Wallet Address').fill('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    await page.getByLabel('Amount').fill('1.0');
    await page.getByRole('button', { name: 'Donate Now' }).click();

    // Check error message is displayed
    await expect(page.getByText(/Test error message|Failed to process donation/)).toBeVisible();
  });
});
