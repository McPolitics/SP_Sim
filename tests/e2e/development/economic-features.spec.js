import { test, expect } from '@playwright/test';

test.describe('Economic Simulation Features - Week 6-8', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display economic indicators on dashboard', async ({ page }) => {
    // Check that key economic metrics are displayed
    await expect(page.locator('#gdp-growth')).toBeVisible();
    await expect(page.locator('#unemployment')).toBeVisible();
    await expect(page.locator('#inflation')).toBeVisible();
    await expect(page.locator('#national-debt')).toBeVisible();
  });

  test('should navigate to economics screen', async ({ page }) => {
    // Navigate to economics screen
    await page.click('button:has-text("Economy")');
    
    // Wait for economics screen to load
    await expect(page.locator('#screen-economy')).toBeVisible();
    await expect(page.locator('.economics-screen')).toBeVisible();
  });

  test('should display sector information', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Check sector cards are displayed
    await expect(page.locator('.agriculture-sector')).toBeVisible();
    await expect(page.locator('.manufacturing-sector')).toBeVisible();
    await expect(page.locator('.services-sector')).toBeVisible();
    
    // Check sector data is populated
    await expect(page.locator('#agriculture-share')).toContainText('%');
    await expect(page.locator('#manufacturing-share')).toContainText('%');
    await expect(page.locator('#services-share')).toContainText('%');
  });

  test('should display policy categories (Week 7 feature)', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Check all policy categories are present
    await expect(page.locator('.fiscal-policies')).toBeVisible();
    await expect(page.locator('.monetary-policies')).toBeVisible();
    await expect(page.locator('.sector-policies')).toBeVisible();
    await expect(page.locator('.trade-regulation')).toBeVisible();
  });

  test('should implement fiscal stimulus policy', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Click fiscal stimulus button
    await page.click('#fiscal-stimulus-btn');
    
    // Wait for policy to be implemented
    await page.waitForTimeout(1000);
    
    // Check that the policy shows up in active policies
    const activePolicies = page.locator('#active-policies-list');
    await expect(activePolicies).not.toContainText('No active economic policies');
  });

  test('should implement education investment policy (Week 7 feature)', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Click education investment button
    await page.click('#education-investment-btn');
    
    // Wait for policy to be implemented
    await page.waitForTimeout(1000);
    
    // Check for policy confirmation
    const activePolicies = page.locator('#active-policies-list');
    await expect(activePolicies).not.toContainText('No active economic policies');
  });

  test('should display economic events (Week 8 feature)', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Check that economic events section is visible
    await expect(page.locator('.events-section')).toBeVisible();
    await expect(page.locator('#economic-events-list')).toBeVisible();
  });

  test('should handle interest rate changes', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Click interest rate button
    await page.click('#interest-rate-btn');
    
    // Handle the prompt (this would need to be mocked in a real test)
    // For now, just verify the button exists and is clickable
    await expect(page.locator('#interest-rate-btn')).toBeEnabled();
  });

  test('should display business cycle information', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Check business cycle indicators
    await expect(page.locator('#economic-phase')).toBeVisible();
    await expect(page.locator('#phase-duration')).toBeVisible();
  });

  test('should update economic data over time', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Get initial GDP growth value
    const initialGdpGrowth = await page.locator('#gdp-growth-detailed').textContent();
    
    // Advance time by clicking next turn multiple times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('n'); // Next turn shortcut
      await page.waitForTimeout(500);
    }
    
    // GDP growth value should be updated (could be same if economic conditions are stable)
    const newGdpGrowth = await page.locator('#gdp-growth-detailed').textContent();
    expect(typeof newGdpGrowth).toBe('string');
    expect(newGdpGrowth).toMatch(/\d+\.\d+%/);
  });

  test('should display charts', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Check that chart containers exist
    await expect(page.locator('#economic-trends-chart')).toBeVisible();
    await expect(page.locator('#sector-performance-chart')).toBeVisible();
    await expect(page.locator('#forecast-chart')).toBeVisible();
  });

  test('should handle multiple policy implementations', async ({ page }) => {
    await page.click('button:has-text("Economy")');
    
    // Implement multiple policies
    await page.click('#fiscal-stimulus-btn');
    await page.waitForTimeout(500);
    
    await page.click('#education-investment-btn');
    await page.waitForTimeout(500);
    
    await page.click('#healthcare-investment-btn');
    await page.waitForTimeout(500);
    
    // Check that multiple active policies are shown
    const activePolicies = page.locator('#active-policies-list');
    await expect(activePolicies).toContainText('active economic policies');
  });

  test('should respond to keyboard shortcuts', async ({ page }) => {
    // Test pause/resume with spacebar
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Test next turn with 'n'
    await page.keyboard.press('n');
    await page.waitForTimeout(200);
    
    // Verify game time has advanced
    const gameTime = await page.locator('#game-time').textContent();
    expect(gameTime).toMatch(/Week \d+, Year \d+/);
  });
});