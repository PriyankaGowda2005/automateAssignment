const { Page, Locator } = require('@playwright/test');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');

/**
 * Base Page Object Model class
 * Contains common methods and properties shared across all page objects
 * Implements proper error handling and wait strategies (no hard waits)
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL with retry mechanism for network errors
   * @param {string} url - URL to navigate to (relative or absolute)
   * @param {Object} options - Navigation options (timeout, waitUntil, retries)
   */
  async goto(url, options = {}) {
    const maxRetries = options.retries || 3; // Reduced retries but with better strategy
    const gotoOptions = {
      timeout: options.timeout || 120000, // Increased timeout to 120 seconds
      waitUntil: options.waitUntil || 'domcontentloaded',
    };
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Try navigation with different strategies
        if (attempt === 1) {
          // First attempt: use domcontentloaded (fastest)
          gotoOptions.waitUntil = 'domcontentloaded';
        } else if (attempt === 2) {
          // Second attempt: use load (more complete)
          gotoOptions.waitUntil = 'load';
        } else {
          // Third attempt: use networkidle (most complete, but slowest)
          gotoOptions.waitUntil = 'networkidle';
        }
        
        // For HTTP/2 errors, try with networkidle as a fallback
        if (attempt > 3) {
          gotoOptions.waitUntil = 'networkidle';
        }
        
        await this.page.goto(url, gotoOptions);
        logger.info(`Successfully navigated to: ${url}`);
        
        // Wait a bit for page to stabilize
        try {
          await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
        } catch (e) {
          // Ignore if already loaded
        }
        
        return;
      } catch (error) {
        // Check for any network or timeout errors (case-insensitive)
        const errorMessage = error.message.toLowerCase();
        const isNetworkError = errorMessage.includes('err_http2_protocol_error') || 
                               errorMessage.includes('net::') ||
                               errorMessage.includes('navigation timeout') ||
                               errorMessage.includes('timeout') ||
                               errorMessage.includes('err_connection') ||
                               errorMessage.includes('timeout exceeded') ||
                               errorMessage.includes('page.goto') ||
                               error.name === 'TimeoutError';
        
        if (isNetworkError && attempt < maxRetries) {
          const waitTime = Math.min(attempt * 2000, 10000); // Exponential backoff: 2s, 4s, 6s, 8s, 10s
          logger.warn(`Navigation attempt ${attempt} failed: ${error.message}. Retrying in ${waitTime}ms...`);
          
          // For timeout errors, reduce timeout on retry and use more lenient wait strategy
          if (errorMessage.includes('timeout')) {
            // Reduce timeout slightly on retry to fail faster and retry more
            gotoOptions.timeout = Math.max(60000, gotoOptions.timeout - 20000);
            logger.info(`Reduced timeout to ${gotoOptions.timeout}ms for retry attempt ${attempt + 1}`);
          }
          
          // For HTTP2 errors, add extra delay
          if (errorMessage.includes('err_http2_protocol_error')) {
            await this.page.waitForTimeout(2000);
          }
          
          // For connection reset errors, wait a bit longer
          if (error.message.includes('ERR_CONNECTION_RESET')) {
            await this.page.waitForTimeout(waitTime * 2);
          } else {
            await this.page.waitForTimeout(waitTime);
          }
          continue;
        }
        
        // If we've exhausted all retries, throw the error
        if (attempt >= maxRetries) {
          logger.error(`Failed to navigate to ${url} after ${maxRetries} attempts: ${error.message}`);
          throw error;
        }
        
        // For non-network errors, throw immediately
        throw error;
      }
    }
  }

  /**
   * Wait for element to be visible with proper error handling
   * Uses retry mechanism instead of hard waits
   * @param {Locator} locator - Playwright locator
   * @param {number} timeout - Timeout in milliseconds (default: 30000)
   * @throws {Error} If element is not found within timeout
   */
  async waitForElement(locator, timeout = 30000) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      logger.info(`Element is visible: ${locator}`);
    } catch (error) {
      logger.error(`Element not visible within ${timeout}ms: ${error.message}`);
      throw new Error(`Element wait timeout: ${error.message}`);
    }
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator, timeout) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Check if element is visible (non-blocking)
   * Returns false immediately if element is not found (no exception)
   * @param {Locator} locator - Playwright locator
   * @param {number} timeout - Timeout in milliseconds (default: 5000)
   * @returns {Promise<boolean>} - True if element is visible
   */
  async isElementVisible(locator, timeout = 5000) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      logger.debug(`Element is visible: ${locator}`);
      return true;
    } catch (error) {
      logger.debug(`Element not visible: ${error.message}`);
      return false;
    }
  }

  /**
   * Fill input field with text and validation
   * Includes error handling and input validation
   * @param {Locator} locator - Playwright locator
   * @param {string} text - Text to fill
   * @param {Object} options - Options for filling (validate, timeout)
   * @throws {Error} If input cannot be filled
   */
  async fillInput(locator, text, options = {}) {
    try {
      await this.waitForElement(locator, options.timeout);
      await locator.clear();
      await locator.fill(text);
      
      // Validate input if option is enabled
      if (options.validate !== false) {
        const enteredValue = await locator.inputValue();
        if (enteredValue !== text) {
          throw new Error(`Input validation failed. Expected: "${text}", Got: "${enteredValue}"`);
        }
      }
      
      logger.info(`Successfully filled input with: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    } catch (error) {
      logger.error(`Failed to fill input: ${error.message}`);
      throw error;
    }
  }

  /**
   * Click on element with error handling
   * Waits for element to be enabled before clicking
   * @param {Locator} locator - Playwright locator
   * @param {Object} options - Click options (timeout, force)
   * @throws {Error} If element cannot be clicked
   */
  async clickElement(locator, options = {}) {
    try {
      await this.waitForElement(locator, options.timeout);
      
      // Wait for element to be enabled (unless force click)
      if (!options.force) {
        await locator.waitFor({ state: 'attached' });
        const isEnabled = await locator.isEnabled();
        if (!isEnabled) {
          throw new Error('Element is not enabled');
        }
      }
      
      await locator.click(options);
      logger.info(`Successfully clicked element: ${locator}`);
    } catch (error) {
      logger.error(`Failed to click element: ${error.message}`);
      throw error;
    }
  }

  /**
   * Double click on element
   */
  async doubleClickElement(locator) {
    await this.waitForElement(locator);
    await locator.dblclick();
  }

  /**
   * Get text content of element
   */
  async getText(locator) {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { BasePage };

