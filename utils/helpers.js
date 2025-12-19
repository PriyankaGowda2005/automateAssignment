const { expect } = require('@playwright/test');
const logger = require('./logger');

/**
 * Helper utility functions for common test operations
 * Provides reusable functions to avoid code duplication
 */
class Helpers {
  /**
   * Wait for element with retry mechanism (no hard waits)
   * @param {Object} page - Playwright page object
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   * @returns {Promise<boolean>} - True if element found, false otherwise
   */
  static async waitForElementWithRetry(page, selector, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const timeout = options.timeout || 5000;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.waitForSelector(selector, { 
          state: 'visible', 
          timeout: timeout 
        });
        logger.info(`Element found: ${selector} (attempt ${i + 1})`);
        return true;
      } catch (error) {
        if (i === maxRetries - 1) {
          logger.error(`Element not found after ${maxRetries} attempts: ${selector}`);
          return false;
        }
        logger.warn(`Retry ${i + 1}/${maxRetries} for selector: ${selector}`);
        await page.waitForTimeout(1000); // Small delay between retries
      }
    }
    return false;
  }

  /**
   * Take screenshot with descriptive name
   * @param {Object} page - Playwright page object
   * @param {string} name - Screenshot name
   */
  static async takeScreenshot(page, name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `test-results/screenshots/${name}_${timestamp}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      logger.info(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Verify element is visible and enabled
   * @param {Object} locator - Playwright locator
   * @returns {Promise<boolean>} - True if element is visible and enabled
   */
  static async isElementVisibleAndEnabled(locator) {
    try {
      const isVisible = await locator.isVisible();
      const isEnabled = await locator.isEnabled();
      return isVisible && isEnabled;
    } catch (error) {
      logger.error(`Error checking element state: ${error.message}`);
      return false;
    }
  }

  /**
   * Fill input field with validation
   * @param {Object} locator - Playwright locator
   * @param {string} value - Value to fill
   * @param {Object} options - Options for filling
   */
  static async fillInputWithValidation(locator, value, options = {}) {
    try {
      await locator.waitFor({ state: 'visible', timeout: options.timeout || 5000 });
      await locator.clear();
      await locator.fill(value);
      
      // Verify the value was entered correctly
      if (options.validate) {
        const enteredValue = await locator.inputValue();
        if (enteredValue !== value) {
          throw new Error(`Value mismatch. Expected: ${value}, Got: ${enteredValue}`);
        }
      }
      
      logger.info(`Successfully filled input with value: ${value}`);
    } catch (error) {
      logger.error(`Failed to fill input: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for network to be idle (no hard waits)
   * @param {Object} page - Playwright page object
   * @param {number} timeout - Timeout in milliseconds
   */
  static async waitForNetworkIdle(page, timeout = 30000) {
    try {
      await page.waitForLoadState('networkidle', { timeout });
      logger.info('Network is idle');
    } catch (error) {
      logger.warn(`Network idle timeout: ${error.message}`);
    }
  }

  /**
   * Handle errors gracefully with logging
   * @param {Function} fn - Function to execute
   * @param {string} errorMessage - Custom error message
   * @returns {Promise<any>} - Function result or null on error
   */
  static async handleError(fn, errorMessage = 'An error occurred') {
    try {
      return await fn();
    } catch (error) {
      logger.error(`${errorMessage}: ${error.message}`);
      logger.error(error.stack);
      return null;
    }
  }

  /**
   * Generate random string for test data
   * @param {number} length - Length of string
   * @returns {string} - Random string
   */
  static generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Verify API response structure
   * @param {Object} response - API response object
   * @param {Array} requiredFields - Array of required field names
   * @returns {boolean} - True if all required fields exist
   */
  static verifyResponseStructure(response, requiredFields) {
    try {
      for (const field of requiredFields) {
        if (!(field in response)) {
          logger.error(`Required field missing: ${field}`);
          return false;
        }
      }
      logger.info('API response structure verified');
      return true;
    } catch (error) {
      logger.error(`Error verifying response structure: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if an error is a DNS resolution error
   * @param {Error} error - Error object to check
   * @returns {boolean} - True if error is DNS-related
   */
  static isDNSError(error) {
    if (!error || !error.message) return false;
    const errorMsg = error.message.toLowerCase();
    return errorMsg.includes('err_name_not_resolved') ||
           errorMsg.includes('could not resolve hostname') ||
           errorMsg.includes('enotfound') ||
           errorMsg.includes('getaddrinfo');
  }

  /**
   * Get user-friendly DNS error message
   * @param {Error} error - DNS error object
   * @param {string} url - URL that failed
   * @returns {string} - User-friendly error message
   */
  static getDNSErrorMessage(error, url) {
    return `DNS resolution failed for ${url}.\n` +
           `This usually means:\n` +
           `1. Your internet connection is not working\n` +
           `2. DNS server cannot resolve the domain name\n` +
           `3. The domain might be incorrect or the site might be down\n` +
           `4. You may need to configure a different BASE_URL in your .env file\n\n` +
           `Error details: ${error.message}\n\n` +
           `To fix:\n` +
           `- Check your internet connection\n` +
           `- Verify DNS settings (try: nslookup www.automationanywhere.com)\n` +
           `- Check if the URL in .env file is correct\n` +
           `- If testing against a different environment, update BASE_URL in .env`;
  }
}

module.exports = Helpers;

