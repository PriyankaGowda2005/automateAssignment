const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

/**
 * Visual Regression Testing Utility
 * Compares screenshots to detect visual changes
 */
class VisualRegressionHelper {
  constructor() {
    this.screenshotsDir = path.resolve(__dirname, '../test-results/screenshots');
    this.baselineDir = path.resolve(__dirname, '../test-results/baseline');
    this.ensureDirectories();
  }

  /**
   * Ensure screenshot directories exist
   */
  ensureDirectories() {
    [this.screenshotsDir, this.baselineDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Take screenshot and compare with baseline
   * @param {Object} page - Playwright page object
   * @param {string} name - Screenshot name
   * @param {Object} options - Comparison options
   * @returns {Promise<boolean>} - True if visual match, false otherwise
   */
  async compareScreenshot(page, name, options = {}) {
    try {
      const screenshotPath = path.join(this.screenshotsDir, `${name}.png`);
      const baselinePath = path.join(this.baselineDir, `${name}.png`);

      // Take current screenshot
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: options.fullPage !== false 
      });

      // If baseline doesn't exist, create it
      if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(screenshotPath, baselinePath);
        logger.info(`Baseline screenshot created: ${baselinePath}`);
        return true;
      }

      // Compare screenshots using Playwright's built-in comparison
      // Note: For more advanced comparison, consider using pixelmatch or similar
      const currentBuffer = fs.readFileSync(screenshotPath);
      const baselineBuffer = fs.readFileSync(baselinePath);

      // Simple byte comparison (for production, use image comparison library)
      const match = currentBuffer.equals(baselineBuffer);
      
      if (!match) {
        logger.warn(`Visual regression detected for: ${name}`);
        // Save diff image if needed
        const diffPath = path.join(this.screenshotsDir, `${name}_diff.png`);
        // In production, use pixelmatch or similar to create diff image
      } else {
        logger.info(`Visual regression check passed for: ${name}`);
      }

      return match;
    } catch (error) {
      logger.error(`Visual regression check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Update baseline screenshot
   * @param {string} name - Screenshot name
   */
  updateBaseline(name) {
    try {
      const screenshotPath = path.join(this.screenshotsDir, `${name}.png`);
      const baselinePath = path.join(this.baselineDir, `${name}.png`);

      if (fs.existsSync(screenshotPath)) {
        fs.copyFileSync(screenshotPath, baselinePath);
        logger.info(`Baseline updated: ${baselinePath}`);
      } else {
        throw new Error(`Screenshot not found: ${screenshotPath}`);
      }
    } catch (error) {
      logger.error(`Failed to update baseline: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new VisualRegressionHelper();

