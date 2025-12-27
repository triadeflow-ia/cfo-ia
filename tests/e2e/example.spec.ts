import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  
  // For now, just check if the page loads
  // In the future, add more specific tests
  await expect(page).toHaveTitle(/CFO IA/)
})





