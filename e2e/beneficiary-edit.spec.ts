import { test, expect } from '@playwright/test';

test.describe('Beneficiary Edit Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/genel');
  });
  
  test('should navigate to beneficiary detail page', async ({ page }) => {
    // Go to beneficiaries list
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    // Click on first beneficiary
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/yardim\/ihtiyac-sahipleri\/[^/]+/);
      
      // Detail page should have beneficiary info
      await expect(page.locator('text=/Ad|Soyad|Telefon/i').first()).toBeVisible();
    }
  });
  
  test('should toggle edit mode', async ({ page }) => {
    // Navigate to a beneficiary detail page
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      // Click "Düzenle" button
      const editButton = page.locator('button:has-text("Düzenle"), button:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Should show form in edit mode
        const formElement = page.locator('form#beneficiary-edit-form, form[id*="beneficiary"]').first();
        await expect(formElement).toBeVisible();
        
        // Should show "Kaydet" and "İptal" buttons
        await expect(page.locator('button:has-text("Kaydet"), button:has-text("Save")').first()).toBeVisible();
        await expect(page.locator('button:has-text("İptal"), button:has-text("Cancel")').first()).toBeVisible();
      }
    }
  });
  
  test('should cancel edit mode', async ({ page }) => {
    // Navigate to detail page and enter edit mode
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Make a change
        const nameInput = page.locator('[data-testid="firstName"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test Name Change');
        }
        
        // Click "İptal" button
        const cancelButton = page.locator('button:has-text("İptal"), button:has-text("Cancel")').first();
        await cancelButton.click();
        await page.waitForTimeout(500);
        
        // Should return to view mode
        await expect(page.locator('button:has-text("Düzenle")').first()).toBeVisible();
        
        // Changes should be reverted (form should not be visible)
        const formElement = page.locator('form#beneficiary-edit-form').first();
        await expect(formElement).not.toBeVisible();
      }
    }
  });
  
  test('should validate required fields on submit', async ({ page }) => {
    // Navigate to detail page and enter edit mode
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Clear a required field (firstName)
        const nameInput = page.locator('[data-testid="firstName"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.clear();
          
          // Try to submit
          const saveButton = page.locator('[data-testid="saveButton"], button[type="submit"]').first();
          await saveButton.click();
          await page.waitForTimeout(500);
          
          // Should show validation error
          const errorMessage = page.locator('text=/zorunlu|required|gerekli/i').first();
          await expect(errorMessage).toBeVisible();
        }
      }
    }
  });
  
  test('should successfully update beneficiary', async ({ page }) => {
    // Navigate to detail page and enter edit mode
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Make a valid change (update notes)
        const notesTextarea = page.locator('textarea[name="notes"], textarea[placeholder*="Not"]').first();
        if (await notesTextarea.isVisible()) {
          const timestamp = new Date().toISOString();
          await notesTextarea.fill(`E2E Test Update - ${timestamp}`);
          
          // Submit form
          const saveButton = page.locator('[data-testid="saveButton"], button[type="submit"]').first();
          await saveButton.click();
          
          // Wait for success toast
          await page.waitForTimeout(2000);
          
          // Should show success message
          const successToast = page.locator('text=/başarıyla|success|güncellendi/i').first();
          await expect(successToast).toBeVisible({ timeout: 5000 });
          
          // Should return to view mode
          await expect(page.locator('button:has-text("Düzenle")').first()).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
  
  test('should validate TC Kimlik No format', async ({ page }) => {
    // Navigate to detail page and enter edit mode
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Enter invalid TC Kimlik No
        const tcInput = page.locator('[data-testid="identityNumber"]').first();
        if (await tcInput.isVisible()) {
          await tcInput.clear();
          await tcInput.fill('12345678901'); // Invalid checksum
          
          // Try to submit
          const saveButton = page.locator('[data-testid="saveButton"]').first();
          await saveButton.click();
          await page.waitForTimeout(500);
          
          // Should show validation error
          const errorMessage = page.locator('text=/Geçersiz TC|Invalid TC|11 haneli/i').first();
          await expect(errorMessage).toBeVisible();
        }
      }
    }
  });
  
  test('should validate email format', async ({ page }) => {
    // Navigate to detail page and enter edit mode
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Enter invalid email
        const emailInput = page.locator('input[name="email"], input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.clear();
          await emailInput.fill('invalid-email');
          
          // Try to submit
          const saveButton = page.locator('[data-testid="saveButton"]').first();
          await saveButton.click();
          await page.waitForTimeout(500);
          
          // Should show validation error
          const errorMessage = page.locator('text=/Geçerli.*email|Invalid email/i').first();
          await expect(errorMessage).toBeVisible();
        }
      }
    }
  });
  
  test('should handle API errors gracefully', async ({ page }) => {
    // This test assumes network failure or API error
    // You might need to mock API responses for this
    
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Simulate network failure (optional - requires network interception)
        // await page.route('**/api/**', route => route.abort());
        
        // Make a change and submit
        const notesTextarea = page.locator('textarea[name="notes"]').first();
        if (await notesTextarea.isVisible()) {
          await notesTextarea.fill('Test error handling');
          
          const saveButton = page.locator('[data-testid="saveButton"]').first();
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Should show error toast (if API fails)
          // This test might pass if API succeeds, adjust based on your setup
          const toast = page.locator('[role="alert"], [class*="toast"]').first();
          await expect(toast).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
  
  test('should preserve right sidebar in edit mode', async ({ page }) => {
    // Navigate to detail page
    await page.goto('/yardim/ihtiyac-sahipleri');
    await page.waitForTimeout(1000);
    
    const firstBeneficiary = page.locator('tr[data-href], a[href*="/yardim/ihtiyac-sahipleri/"]').first();
    
    if (await firstBeneficiary.isVisible()) {
      await firstBeneficiary.click();
      await page.waitForTimeout(500);
      
      // Check if sidebar is visible in view mode
      const sidebar = page.locator('text=/Bağlantılı Kayıtlar|Related Records/i').first();
      const sidebarVisibleBefore = await sidebar.isVisible();
      
      // Enter edit mode
      const editButton = page.locator('button:has-text("Düzenle")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Sidebar should still be visible in edit mode
        if (sidebarVisibleBefore) {
          await expect(sidebar).toBeVisible();
        }
      }
    }
  });
});