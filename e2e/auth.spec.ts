import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/genel')

    // Should show welcome message
    await expect(page.locator('text=Hoş geldiniz')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Giriş yapılamadı')).toBeVisible()
  })

  test('should redirect authenticated users away from login', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Wait for redirect
    await expect(page).toHaveURL('/genel')

    // Try to visit login page again
    await page.goto('/login')

    // Should redirect back to dashboard
    await expect(page).toHaveURL('/genel')
  })
})

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/genel')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should allow authenticated users to access dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Access dashboard
    await page.goto('/yardim/ihtiyac-sahipleri')

    // Should show beneficiary list
    await expect(page.locator('text=İhtiyaç Sahipleri')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
  })

  test('should navigate between modules', async ({ page }) => {
    await page.goto('/genel')

    // Click on Bağışlar module
    await page.click('text=Bağışlar')

    // Should navigate to donations list
    await expect(page).toHaveURL('/bagis/liste')
    await expect(page.locator('text=Bağış Listesi')).toBeVisible()
  })

  test('should handle sidebar collapse/expand', async ({ page }) => {
    await page.goto('/genel')

    // Click sidebar toggle
    await page.click('[data-testid="sidebar-toggle"]')

    // Sidebar should collapse
    await expect(page.locator('.sidebar-collapsed')).toBeVisible()

    // Click again to expand
    await page.click('[data-testid="sidebar-toggle"]')
    await expect(page.locator('.sidebar-expanded')).toBeVisible()
  })
})
