const { BasePage } = require('./BasePage');
const logger = require('../utils/logger');

/**
 * Login Page Object Model
 * Handles all interactions with the login page
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Comprehensive selectors for better compatibility with different page structures
    // Username/Email input selectors - multiple strategies
    this.usernameInput = page.locator('input[name="username"], input[name="email"], input[type="email"], input[id*="username" i], input[id*="email" i], input[id*="user" i], input[placeholder*="username" i], input[placeholder*="email" i], input[placeholder*="user" i], input[aria-label*="username" i], input[aria-label*="email" i]').first();
    
    // Password input selectors - multiple strategies
    this.passwordInput = page.locator('input[name="password"], input[type="password"], input[id*="password" i], input[id*="pass" i], input[placeholder*="password" i], input[placeholder*="Password" i], input[aria-label*="password" i], input[aria-label*="Password" i]').first();
    
    // Login button selectors - multiple strategies
    this.loginButton = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login"), button:has-text("log in"), button:has-text("Sign In"), button[id*="login" i], button[id*="signin" i], button[class*="login" i], button[class*="signin" i], input[type="submit"][value*="Log" i], input[type="submit"][value*="Sign" i]').first();
    
    // Error message selectors
    this.errorMessage = page.locator('.error, .alert-error, [role="alert"], [class*="error" i], [class*="alert" i], [id*="error" i]');
    
    // Forgot password link
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("forgot password"), a[href*="forgot" i]');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    // Try navigation with retries - the BasePage will handle different wait strategies
    // Navigate to Community Edition Control Room login page
    // URL: https://community2.cloud-2.automationanywhere.digital/#/login
    await this.goto('/#/login', {
      waitUntil: 'domcontentloaded',
      timeout: 90000, // Start with 90 seconds
      retries: 3
    });
    
    // Wait for page to be ready - use very lenient strategy
    try {
      // Just wait a bit for any dynamic content
      await this.page.waitForTimeout(2000);
    } catch (error) {
      // Ignore timeout errors - page might be ready anyway
      logger.debug('Wait timeout, continuing');
    }
  }

  /**
   * Perform login with credentials
   */
  async login(username, password) {
    // Wait for page to be ready
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    // Wait for username field with extended timeout and multiple strategies
    let usernameField = null;
    const usernameSelectors = [
      this.usernameInput,
      this.page.locator('input[type="email"]'),
      this.page.locator('input[name*="user" i]'),
      this.page.locator('input[name*="email" i]'),
      this.page.locator('input[id*="user" i]'),
      this.page.locator('input[id*="email" i]'),
      this.page.locator('input[placeholder*="user" i]'),
      this.page.locator('input[placeholder*="email" i]')
    ];
    
    for (let i = 0; i < usernameSelectors.length; i++) {
      const selector = usernameSelectors[i];
      try {
        await selector.waitFor({ state: 'visible', timeout: 10000 });
        usernameField = selector;
        logger.info(`Username field found using selector ${i + 1}`);
        break;
      } catch (error) {
        logger.debug(`Username selector ${i + 1} not found, trying next...`);
      }
    }
    
    if (!usernameField) {
      // Last resort: find any email input
      const emailInputs = await this.page.locator('input[type="email"]').count();
      if (emailInputs > 0) {
        usernameField = this.page.locator('input[type="email"]').first();
      } else {
        throw new Error('Username field not found on the page');
      }
    }
    
    await this.fillInput(usernameField, username);
    
    // Wait a bit for password field to appear (some forms show it after username is filled)
    await this.page.waitForTimeout(500);
    
    // Wait for password field to appear - try multiple strategies
    let passwordField = null;
    const passwordSelectors = [
      this.passwordInput,
      this.page.locator('input[type="password"]'),
      this.page.locator('input[type="password"]').first(),
      this.page.locator('input[name*="pass" i]'),
      this.page.locator('input[id*="pass" i]'),
      this.page.locator('input[placeholder*="password" i]'),
      this.page.locator('input[placeholder*="Password" i]'),
      this.page.locator('input[aria-label*="password" i]'),
      this.page.locator('input[aria-label*="Password" i]')
    ];
    
    // Try each selector with increasing wait time
    for (let i = 0; i < passwordSelectors.length; i++) {
      const selector = passwordSelectors[i];
      const waitTime = Math.min(5000 + (i * 1000), 20000); // 5s, 6s, 7s, etc. up to 20s
      
      try {
        // Try both visible and attached states
        try {
          await selector.waitFor({ state: 'visible', timeout: waitTime });
        } catch (e) {
          await selector.waitFor({ state: 'attached', timeout: waitTime });
        }
        
        // Verify it's actually a password field
        const inputType = await selector.getAttribute('type').catch(() => '');
        let isPassword = false;
        try {
          isPassword = await selector.evaluate(el => el.type === 'password');
        } catch (e) {
          isPassword = inputType === 'password';
        }
        
        if (isPassword || inputType === 'password') {
          passwordField = selector;
          logger.info(`Password field found using selector ${i + 1}`);
          break;
        }
      } catch (error) {
        logger.debug(`Password selector ${i + 1} not found, trying next...`);
      }
    }
    
    if (!passwordField) {
      // Last resort: try to find any password input on the page (including in iframes)
      try {
        const allPasswordInputs = await this.page.locator('input[type="password"]').count();
        if (allPasswordInputs > 0) {
          passwordField = this.page.locator('input[type="password"]').first();
          logger.info('Found password field using fallback method');
        } else {
          // Check if there are iframes
          const iframes = await this.page.frames();
          for (const frame of iframes) {
            try {
              const framePasswordInputs = await frame.locator('input[type="password"]').count();
              if (framePasswordInputs > 0) {
                passwordField = frame.locator('input[type="password"]').first();
                logger.info('Found password field in iframe');
                break;
              }
            } catch (e) {
              // Continue checking other frames
            }
          }
        }
      } catch (e) {
        // Ignore errors in fallback
      }
      
      if (!passwordField) {
        // Take a screenshot for debugging
        await this.page.screenshot({ path: 'test-results/password-field-not-found.png', fullPage: true });
        throw new Error('Password field not found on the page after trying all selectors');
      }
    }
    
    await this.fillInput(passwordField, password);
    
    // Wait a bit before clicking login button
    await this.page.waitForTimeout(500);
    
    // Find and click login button with multiple strategies
    let loginBtn = null;
    const loginButtonSelectors = [
      this.loginButton,
      this.page.locator('button[type="submit"]'),
      this.page.locator('input[type="submit"]'),
      this.page.locator('button:has-text("Log")'),
      this.page.locator('button:has-text("Sign")')
    ];
    
    for (const selector of loginButtonSelectors) {
      try {
        if (await this.isElementVisible(selector, 3000)) {
          loginBtn = selector;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (loginBtn) {
      await this.clickElement(loginBtn);
    } else {
      // Last resort: try pressing Enter on password field
      await passwordField.press('Enter');
    }
    
    // Wait for navigation after login with more lenient strategy
    try {
      // Wait for URL to change from login page (indicates successful navigation)
      // For hash-based routing, check if hash changed
      let urlChanged = false;
      const initialUrl = this.page.url();
      
      for (let i = 0; i < 15; i++) {
        await this.page.waitForTimeout(1000);
        const currentUrl = this.page.url();
        if (currentUrl !== initialUrl || !currentUrl.includes('#/login')) {
          urlChanged = true;
          logger.info('URL changed after login');
          break;
        }
      }
      
      if (!urlChanged) {
        logger.info('URL did not change, but continuing...');
      }
      
      // Wait for page to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      
      // Give the page a moment to render
      await this.page.waitForTimeout(2000);
    } catch (error) {
      // If load state times out, try domcontentloaded as fallback
      logger.info('Load state timeout after login, using domcontentloaded as fallback');
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Check if login was successful
   */
  async isLoggedIn() {
    // Wait a bit for page to load
    await this.page.waitForTimeout(1000);
    
    // First check: URL should not be on login page
    const currentUrl = this.page.url();
    const isOnLoginPage = currentUrl.includes('#/login') || currentUrl.includes('/login');
    
    if (isOnLoginPage) {
      logger.debug('Still on login page, login may have failed');
      // Check for error messages
      const errorMessage = await this.getErrorMessage();
      if (errorMessage) {
        logger.warn(`Login error detected: ${errorMessage}`);
        return false;
      }
      // Check if login form is still visible - if so, login definitely failed
      const loginFormVisible = await this.isElementVisible(this.usernameInput, 2000) || 
                               await this.isElementVisible(this.passwordInput, 2000) ||
                               await this.isElementVisible(this.loginButton, 2000);
      if (loginFormVisible) {
        logger.debug('Login form still visible, login failed');
        return false;
      }
      // Give it a bit more time for async operations
      await this.page.waitForTimeout(2000);
      
      // Re-check URL after wait
      const newUrl = this.page.url();
      if (newUrl.includes('#/login') || newUrl.includes('/login')) {
        logger.debug('Still on login page after wait, login failed');
        return false;
      }
    }
    
    // Check for elements that appear after successful login
    // Comprehensive selectors for Automation Anywhere Control Room
    // Use more specific indicators that only appear after successful login
    const dashboardIndicators = [
      // Most reliable: Create button in top right (only appears after login)
      this.page.locator('button:has-text("+ Create"), button:has-text("Create")'),
      // Navigation elements that are specific to logged-in state
      this.page.locator('nav >> text=Automation'),
      this.page.locator('[class*="sidebar" i] >> text=Automation'),
      // Control Room specific elements
      this.page.locator('[class*="dashboard" i]'),
      this.page.locator('[data-testid*="dashboard" i]')
    ];

    let foundIndicators = 0;
    for (const indicator of dashboardIndicators) {
      try {
        if (await this.isElementVisible(indicator, 3000)) {
          foundIndicators++;
          logger.debug(`Found dashboard indicator: ${indicator}`);
        }
      } catch (e) {
        // Continue checking other indicators
      }
    }
    
    // Require at least one strong indicator (not just URL change)
    if (foundIndicators === 0) {
      // Final check: If URL changed from login AND we're not on an error page
      const finalUrl = this.page.url();
      const notOnLoginPage = !finalUrl.includes('#/login') && !finalUrl.includes('/login');
      const notOnErrorPage = !finalUrl.includes('error') && !finalUrl.includes('unauthorized');
      
      // Also check if login form is still present - if it is, we're not logged in
      const loginFormStillPresent = await this.isElementVisible(this.usernameInput, 1000) || 
                                    await this.isElementVisible(this.passwordInput, 1000);
      
      if (notOnLoginPage && notOnErrorPage && !loginFormStillPresent) {
        logger.info('Login successful - URL changed from login page and no login form');
        return true;
      }
      
      logger.warn('Login verification failed - no strong indicators found');
      return false;
    }
    
    logger.info(`Login successful - found ${foundIndicators} dashboard indicator(s)`);
    return true;
  }

  /**
   * Get error message if login fails
   */
  async getErrorMessage() {
    if (await this.isElementVisible(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }
}

module.exports = { LoginPage };

