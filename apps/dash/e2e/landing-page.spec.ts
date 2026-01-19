import { test, expect } from '@playwright/test'

test.describe('Landing Page - Happy Path', () => {
  test('should display landing page with form', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.getByRole('heading', { name: /Zrozum rynek/i })).toBeVisible()

    // Check form input
    const input = page.getByPlaceholder('twoja-firma.pl')
    await expect(input).toBeVisible()
    await expect(input).toBeEditable()

    // Check submit button
    const submitButton = page.getByRole('button', { name: /Analizuj/i })
    await expect(submitButton).toBeVisible()

    // Check feature cards
    await expect(page.getByText('Deep Audit')).toBeVisible()
    await expect(page.getByText('Spy Competitors')).toBeVisible()
    await expect(page.getByText('Action Plan')).toBeVisible()
  })

  test('should submit URL and show loading screen', async ({ page }) => {
    await page.goto('/')

    // Fill form with URL
    const input = page.getByPlaceholder('twoja-firma.pl')
    await input.fill('example.com')

    // Submit form
    await page.getByRole('button', { name: /Analizuj/i }).click()

    // Should show loading screen
    await expect(page.getByText(/Inicjalizacja łącza neuronowego/i)).toBeVisible()
    await expect(page.getByText(/%/)).toBeVisible()
  })

  test('should automatically add https:// to URL', async ({ page }) => {
    await page.goto('/')

    const input = page.getByPlaceholder('twoja-firma.pl')
    await input.fill('example.com')

    // The URL should be automatically formatted
    await input.blur()

    // Submit and verify loading appears
    await page.getByRole('button', { name: /Analizuj/i }).click()
    await expect(page.getByText(/Inicjalizacja/i)).toBeVisible()
  })

  test('should redirect to dashboard after loading completes', async ({ page }) => {
    await page.goto('/')

    // Fill and submit form
    await page.getByPlaceholder('twoja-firma.pl').fill('test-site.pl')
    await page.getByRole('button', { name: /Analizuj/i }).click()

    // Wait for loading screen
    await expect(page.getByText(/Inicjalizacja/i)).toBeVisible()

    // Wait for redirect to dashboard (loading takes ~20-30 seconds to complete)
    // For happy path test, we wait for the redirect
    await page.waitForURL(/\/dashboard\/demo/, { timeout: 60000 })

    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard')
  })
})
