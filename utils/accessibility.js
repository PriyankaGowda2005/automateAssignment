const { test } = require('@playwright/test');
const logger = require('./logger');

/**
 * Accessibility Testing Utility
 * Checks for a11y issues in the application
 */
class AccessibilityHelper {
  /**
   * Run basic accessibility checks
   * @param {Object} page - Playwright page object
   * @param {string} testName - Name of the test
   * @returns {Promise<Object>} - Accessibility check results
   */
  static async checkAccessibility(page, testName) {
    const results = {
      passed: true,
      issues: []
    };

    try {
      // Check for images without alt text
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      if (imagesWithoutAlt > 0) {
        results.issues.push({
          type: 'error',
          message: `${imagesWithoutAlt} images found without alt text`,
          severity: 'high'
        });
        results.passed = false;
      }

      // Check for buttons without accessible names
      const buttonsWithoutName = await page.locator('button:not([aria-label]):not(:has-text(""))').count();
      if (buttonsWithoutName > 0) {
        results.issues.push({
          type: 'warning',
          message: `${buttonsWithoutName} buttons found without accessible names`,
          severity: 'medium'
        });
      }

      // Check for form inputs without labels
      const inputsWithoutLabel = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
      if (inputsWithoutLabel > 0) {
        results.issues.push({
          type: 'warning',
          message: `${inputsWithoutLabel} form inputs found without labels`,
          severity: 'medium'
        });
      }

      // Check for heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      if (headings.length > 0) {
        let previousLevel = 0;
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          const level = parseInt(tagName.charAt(1));
          if (previousLevel > 0 && level > previousLevel + 1) {
            results.issues.push({
              type: 'warning',
              message: `Heading hierarchy issue: ${tagName} follows h${previousLevel}`,
              severity: 'low'
            });
          }
          previousLevel = level;
        }
      }

      // Check for color contrast (basic check)
      const lowContrastElements = await page.locator('[style*="color"]').count();
      if (lowContrastElements > 0) {
        results.issues.push({
          type: 'info',
          message: `${lowContrastElements} elements with inline color styles (manual review recommended)`,
          severity: 'low'
        });
      }

      if (results.passed && results.issues.length === 0) {
        logger.info(`Accessibility check passed for: ${testName}`);
      } else {
        logger.warn(`Accessibility issues found for ${testName}:`, results.issues);
      }

      return results;
    } catch (error) {
      logger.error(`Error during accessibility check: ${error.message}`);
      results.passed = false;
      results.issues.push({
        type: 'error',
        message: `Accessibility check failed: ${error.message}`,
        severity: 'high'
      });
      return results;
    }
  }

  /**
   * Verify keyboard navigation
   * @param {Object} page - Playwright page object
   * @returns {Promise<boolean>} - True if keyboard navigation works
   */
  static async verifyKeyboardNavigation(page) {
    try {
      // Check if Tab key navigation works
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      
      if (focusedElement) {
        logger.info(`Keyboard navigation working. Focused element: ${focusedElement}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Keyboard navigation check failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = AccessibilityHelper;

