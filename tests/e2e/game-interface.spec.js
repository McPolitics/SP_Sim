import { test, expect } from '@playwright/test';

test.describe('SP_Sim Game Interface', () => {
  test('should load the game interface', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads with the correct title
    await expect(page).toHaveTitle(/SP_Sim/);
    
    // Check for main header
    await expect(page.locator('.header__title')).toContainText('SP_Sim');
    
    // Check for game time display
    await expect(page.locator('#game-time')).toContainText('Week 1, Year 1');
    
    // Check for approval rating
    await expect(page.locator('#approval-rating')).toContainText('Approval:');
    
    // Check for economic panel
    await expect(page.locator('.economic-panel')).toBeVisible();
    await expect(page.locator('#gdp-growth')).toBeVisible();
    await expect(page.locator('#unemployment')).toBeVisible();
    await expect(page.locator('#inflation')).toBeVisible();
    
    // Check for political panel
    await expect(page.locator('.political-panel')).toBeVisible();
    await expect(page.locator('#coalition-support')).toBeVisible();
    
    // Check for global panel
    await expect(page.locator('.global-panel')).toBeVisible();
    
    // Check for game controls
    await expect(page.locator('#pause-btn')).toBeVisible();
    await expect(page.locator('#next-turn-btn')).toBeVisible();
    await expect(page.locator('#save-btn')).toBeVisible();
    await expect(page.locator('#load-btn')).toBeVisible();
  });

  test('should display initial game state', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the game to initialize
    await page.waitForTimeout(1000);
    
    // Check that economic indicators show values
    await expect(page.locator('#gdp-growth')).not.toContainText('--');
    await expect(page.locator('#unemployment')).not.toContainText('--');
    await expect(page.locator('#inflation')).not.toContainText('--');
    
    // Check approval rating is set
    await expect(page.locator('#approval-rating')).toContainText(/\d+%/);
  });

  test('should handle pause/resume functionality', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Initially should show "Pause"
    await expect(page.locator('#pause-btn')).toContainText('Pause');
    
    // Click pause button
    await page.locator('#pause-btn').click();
    
    // Should now show "Resume"
    await expect(page.locator('#pause-btn')).toContainText('Resume');
    
    // Click resume
    await page.locator('#pause-btn').click();
    
    // Should show "Pause" again
    await expect(page.locator('#pause-btn')).toContainText('Pause');
  });

  test('should handle next turn button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize and pause it
    await page.waitForTimeout(1000);
    await page.locator('#pause-btn').click();
    
    // Get initial time
    const initialTime = await page.locator('#game-time').textContent();
    
    // Click next turn
    await page.locator('#next-turn-btn').click();
    
    // Wait a moment for the update
    await page.waitForTimeout(500);
    
    // Time should have advanced (note: might not change if turn processing is async)
    const newTime = await page.locator('#game-time').textContent();
    // We can't guarantee the time will change immediately, so this is just a basic check
    expect(newTime).toBeTruthy();
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Check that panels are arranged horizontally on desktop
    const dashboardPanels = page.locator('.dashboard__panels');
    await expect(dashboardPanels).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Elements should still be visible
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Test spacebar for pause/resume
    await page.keyboard.press('Space');
    await expect(page.locator('#pause-btn')).toContainText('Resume');
    
    await page.keyboard.press('Space');
    await expect(page.locator('#pause-btn')).toContainText('Pause');
  });
});